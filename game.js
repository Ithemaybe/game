'use strict';

// ── SVG gradient injection ─────────────────────────────────────────
(function() {
  const svg = document.querySelector('.timer-ring svg');
  if (!svg) return;
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#4f8cff"/>
      <stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>`;
  svg.prepend(defs);
})();

// ── CSRF token (injected by Flask into <meta>) ────────────────────
const CSRF = document.querySelector('meta[name="csrf-token"]')?.content || '';

// ── Secure fetch wrapper — always sends CSRF header ───────────────
function api(url, opts = {}) {
  return fetch(url, {
    ...opts,
    credentials: 'same-origin',
    headers: {
      'X-CSRF-Token': CSRF,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
}

// ── DOM refs ──────────────────────────────────────────────────────
const screens = {
  start:  document.getElementById('start-screen'),
  game:   document.getElementById('game-screen'),
  result: document.getElementById('result-screen'),
};

const flagEmoji  = document.getElementById('flag-emoji');
const flagStage  = document.getElementById('flag-stage');
const optBtns    = [...document.querySelectorAll('.opt-btn')];
const feedback   = document.getElementById('feedback');
const timerText  = document.getElementById('timer-text');
const ringFill   = document.getElementById('ring-fill');
const scoreC     = document.getElementById('score-correct');
const scoreW     = document.getElementById('score-wrong');

const resCorrect = document.getElementById('res-correct');
const resWrong   = document.getElementById('res-wrong');
const resTotal   = document.getElementById('res-total');
const pctFill    = document.getElementById('pct-fill');
const pctText    = document.getElementById('pct-text');
const shareUrl   = document.getElementById('share-url');
const copyBtn    = document.getElementById('copy-btn');
const btnStart   = document.getElementById('btn-start');
const btnAgain   = document.getElementById('btn-again');

// ── State ─────────────────────────────────────────────────────────
const DURATION   = 60;
let correct = 0, wrong = 0;
let timeLeft = DURATION;
let timerInterval   = null;
let currentQuestion = null;
let answered        = false;

const CIRCUMFERENCE = 2 * Math.PI * 50;

// ── Helpers ───────────────────────────────────────────────────────
function show(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function updateRing(secs) {
  const frac   = secs / DURATION;
  const offset = CIRCUMFERENCE * (1 - frac);
  ringFill.style.strokeDashoffset = offset;
  ringFill.style.stroke =
    frac > .5 ? 'url(#timerGrad)' :
    frac > .2 ? '#f5c842' : '#f4536a';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Timer ─────────────────────────────────────────────────────────
function startTimer() {
  timeLeft = DURATION;
  timerText.textContent = timeLeft;
  updateRing(timeLeft);
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerText.textContent = timeLeft;
    updateRing(timeLeft);
    if (timeLeft <= 0) endGame();
  }, 1000);
}

// ── Load question ─────────────────────────────────────────────────
async function loadQuestion() {
  answered = false;
  feedback.textContent = '';
  feedback.className   = 'feedback';
  optBtns.forEach(b => { b.disabled = false; b.className = 'opt-btn'; });

  flagStage.classList.add('flip');
  await sleep(200);

  try {
    const r = await api('/api/question');
    if (!r.ok) { endGame(); return; }
    currentQuestion = await r.json();
  } catch {
    currentQuestion = null;
    return;
  }

  flagEmoji.textContent = currentQuestion.flag;
  currentQuestion.options.forEach((opt, i) => {
    optBtns[i].querySelector('.opt-text').textContent = opt;
  });

  flagStage.classList.remove('flip');
}

// ── Answer handling ───────────────────────────────────────────────
async function handleAnswer(idx) {
  if (answered || !currentQuestion) return;
  answered = true;

  const chosen  = currentQuestion.options[idx];
  const isRight = chosen === currentQuestion.correct;

  optBtns.forEach((b, i) => {
    b.disabled = true;
    const name = currentQuestion.options[i];
    if (name === currentQuestion.correct) b.classList.add('correct');
    else if (i === idx && !isRight)        b.classList.add('wrong');
  });

  if (isRight) {
    correct++;
    scoreC.textContent = correct;
    feedback.textContent = '✓ Правильно!';
    feedback.className   = 'feedback correct-fb';
  } else {
    wrong++;
    scoreW.textContent = wrong;
    feedback.textContent = `✗ Это ${currentQuestion.correct}`;
    feedback.className   = 'feedback wrong-fb';
  }

  // Notify server that one question was answered (for score validation)
  api('/api/answered', { method: 'POST', body: JSON.stringify({}) }).catch(() => {});

  await sleep(900);
  loadQuestion();
}

// ── End game ──────────────────────────────────────────────────────
async function endGame() {
  clearInterval(timerInterval);
  show('result');

  resCorrect.textContent = correct;
  resWrong.textContent   = wrong;
  resTotal.textContent   = correct + wrong;

  const total = correct + wrong;
  const pct   = total > 0 ? Math.round(correct / total * 100) : 0;

  requestAnimationFrame(() => {
    pctFill.style.width = pct + '%';
    pctText.textContent = pct + '% правильных';
  });

  const trophy = document.getElementById('result-trophy');
  trophy.textContent = pct >= 80 ? '🏆' : pct >= 50 ? '🥈' : '🌍';

  try {
    const res = await api('/api/save', {
      method: 'POST',
      body: JSON.stringify({ correct, wrong, csrf: CSRF }),
    });
    if (res.ok) {
      const data = await res.json();
      shareUrl.value = `${location.origin}/rezult/${data.result_id}`;
    } else {
      shareUrl.value = '—';
    }
  } catch {
    shareUrl.value = '—';
  }
}

// ── Copy button ───────────────────────────────────────────────────
copyBtn?.addEventListener('click', () => {
  const val = shareUrl.value;
  if (!val || val === '—') return;
  navigator.clipboard.writeText(val).catch(() => {
    shareUrl.select(); document.execCommand('copy');
  });
  copyBtn.classList.add('copied');
  setTimeout(() => copyBtn.classList.remove('copied'), 1500);
});

// ── Game start ────────────────────────────────────────────────────
async function startGame() {
  // For the start screen, verify captcha token exists
  if (screens.start.classList.contains('active') && !captchaToken) {
    return;
  }
  correct = 0; wrong = 0;
  scoreC.textContent = '0';
  scoreW.textContent = '0';
  show('game');
  const res = await api('/api/new_game', {
    method: 'POST',
    body: JSON.stringify({ captcha: captchaToken }),
  });
  if (!res.ok) {
    show('start');
    alert('Проверка капчи не пройдена. Попробуйте снова.');
    if (window.hcaptcha) window.hcaptcha.reset();
    captchaToken = null;
    const btn = document.getElementById('btn-start');
    if (btn) btn.disabled = true;
    return;
  }
  // Reset captcha state after successful game start
  captchaToken = null;
  startTimer();
  loadQuestion();
}

btnStart?.addEventListener('click', startGame);
// "Play again" skips captcha (already passed this session)
btnAgain?.addEventListener('click', () => {
  captchaToken = 'skip';   // flag: re-play, no captcha needed
  startGame();
});

// ── Option buttons ────────────────────────────────────────────────
optBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => handleAnswer(i));
});

// ── Keyboard shortcuts ────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (!screens.game.classList.contains('active')) return;
  const map = {'1':0,'2':1,'3':2,'4':3};
  if (e.key in map) handleAnswer(map[e.key]);
});

// ── hCaptcha callbacks (global, called by hCaptcha script) ────────
let captchaToken = null;

window.onCaptchaDone = function(token) {
  captchaToken = token;
  const btn = document.getElementById('btn-start');
  if (btn) { btn.disabled = false; }
};

window.onCaptchaExpired = function() {
  captchaToken = null;
  const btn = document.getElementById('btn-start');
  if (btn) { btn.disabled = true; }
};
