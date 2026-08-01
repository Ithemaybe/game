'use strict';

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

function encodeResultV1(data) {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Country list is loaded from flags.json (single source of truth, shared
// with V2/V3), which carries both the Russian ("name") and English
// ("name_en") names for every flag. This is what makes the answer options
// follow the site language switcher instead of always staying in Russian.
let COUNTRIES = [];

function getLang() {
  const l = localStorage.getItem('site_lang');
  return (window.__I18N__ && window.__I18N__[l]) ? l : 'ru';
}

function t(key, fallback) {
  const dict = (window.__I18N__ && window.__I18N__[getLang()]) || {};
  return dict[key] !== undefined ? dict[key] : fallback;
}

function localizedName(country) {
  if (!country) return '';
  return getLang() === 'en' ? (country.name_en || country.name) : country.name;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function emojiToTwemojiUrl(emoji) {
  const codepoints = [...emoji]
    .map(ch => ch.codePointAt(0).toString(16))
    .filter(cp => cp !== 'fe0f')
    .join('-');
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`;
}

const screens = {
  start:  document.getElementById('start-screen'),
  game:   document.getElementById('game-screen'),
  result: document.getElementById('result-screen'),
};

const flagImg    = document.getElementById('flag-img');
const flagEmoji  = document.getElementById('flag-emoji');
const flagStage  = document.getElementById('flag-stage');
const optimizeToggle = document.getElementById('optimize-flags-v1');
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
const btnStart   = document.getElementById('btn-start');
const btnAgain   = document.getElementById('btn-again');

const DURATION = 60;
const CIRCUMFERENCE = 2 * Math.PI * 50;

let correct = 0, wrong = 0;
let timeLeft = DURATION;
let timerInterval   = null;
let currentQuestion = null;
let answered        = false;
let queue           = [];
let flagsMap        = null;
let optimizeFlags   = localStorage.getItem('v1_optimize_flags') === '1';

if (optimizeToggle) {
  optimizeToggle.checked = optimizeFlags;
  optimizeToggle.addEventListener('change', () => {
    optimizeFlags = optimizeToggle.checked;
    localStorage.setItem('v1_optimize_flags', optimizeFlags ? '1' : '0');
  });
}

async function getFlagsMap() {
  if (flagsMap) return flagsMap;
  const res = await fetch('flags.json?v=2', { cache: 'force-cache' });
  if (!res.ok) throw new Error('Не удалось загрузить flags.json');
  const flags = await res.json();
  flagsMap = new Map(flags.map(f => [f.code, f]));
  COUNTRIES = flags;
  return flagsMap;
}

async function applyFlag(code, alt) {
  flagStage?.classList.toggle('optimized', optimizeFlags);

  if (optimizeFlags) {
    try {
      const map = await getFlagsMap();
      const emoji = map.get(code)?.emoji || '🏳️';
      flagEmoji.innerHTML = '';
      const img = document.createElement('img');
      img.src = emojiToTwemojiUrl(emoji);
      img.alt = alt;
      img.decoding = 'async';
      flagEmoji.appendChild(img);
      flagImg.removeAttribute('src');
      flagImg.alt = alt;
      return;
    } catch (err) {
      console.warn(err);
      flagStage?.classList.remove('optimized');
    }
  }

  flagEmoji.innerHTML = '';
  flagImg.src = `https://flagcdn.com/w320/${code}.png`;
  flagImg.alt = alt;
}

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

function nextQuestion() {
  if (queue.length === 0) return null;
  const country = queue.pop();
  const others  = shuffle(COUNTRIES.filter(c => c.code !== country.code)).slice(0, 3);
  const options = shuffle([...others, country]);
  // Store codes only — the displayed text is resolved at render time via
  // localizedName(), so a question survives a language switch mid-round.
  return { code: country.code, optionCodes: options.map(c => c.code) };
}

// Re-renders the flag alt text and the 4 answer-option labels for the
// current question in whatever language is active right now. Called both
// when a question loads and again on 'langchange' so an in-progress round
// updates immediately instead of staying stuck in the old language.
function renderQuestionLabels() {
  if (!currentQuestion) return;
  const correctCountry = flagsMap?.get(currentQuestion.code);
  const correctName = localizedName(correctCountry);

  flagImg.alt = correctName;

  currentQuestion.optionCodes.forEach((code, i) => {
    const country = flagsMap?.get(code);
    optBtns[i].querySelector('.opt-text').textContent = localizedName(country);
  });
}

async function loadQuestion() {
  answered = false;
  feedback.textContent = '';
  feedback.className   = 'feedback';
  optBtns.forEach(b => { b.disabled = false; b.className = 'opt-btn'; });

  flagStage.classList.add('flip');
  await sleep(200);

  const q = nextQuestion();

  if (!q) {
    flagStage.classList.remove('flip');
    endGame(true);
    return;
  }

  currentQuestion = q;

  const correctCountry = flagsMap?.get(currentQuestion.code);
  await applyFlag(currentQuestion.code, localizedName(correctCountry));
  renderQuestionLabels();

  flagStage.classList.remove('flip');
}

document.addEventListener('langchange', () => {
  if (screens.game.classList.contains('active')) renderQuestionLabels();
});

function handleAnswer(idx) {
  if (answered || !currentQuestion) return;
  answered = true;

  const chosenCode = currentQuestion.optionCodes[idx];
  const isRight     = chosenCode === currentQuestion.code;
  const correctName = localizedName(flagsMap?.get(currentQuestion.code));

  optBtns.forEach((b, i) => {
    b.disabled = true;
    const code = currentQuestion.optionCodes[i];
    if (code === currentQuestion.code) b.classList.add('correct');
    else if (i === idx && !isRight)     b.classList.add('wrong');
  });

  if (isRight) {
    correct++;
    scoreC.textContent = correct;
    feedback.textContent = t('feedback_correct', '✓ Правильно!');
    feedback.className   = 'feedback correct-fb';
  } else {
    wrong++;
    scoreW.textContent = wrong;
    feedback.textContent = `${t('feedback_wrong_prefix', '✗ Это')} ${correctName}`;
    feedback.className   = 'feedback wrong-fb';
  }

  if (timeLeft > 0) loadQuestion();
}

function endGame(allDone = false) {
  clearInterval(timerInterval);
  show('result');

  resCorrect.textContent = correct;
  resWrong.textContent   = wrong;
  resTotal.textContent   = correct + wrong;

  const total = correct + wrong;
  const pct   = total > 0 ? Math.round(correct / total * 100) : 0;

  requestAnimationFrame(() => {
    pctFill.style.width = pct + '%';
    pctText.textContent = pct + t('pct_correct_suffix', '% правильных');
  });

  const trophy = document.getElementById('result-trophy');
  trophy.textContent = pct >= 80 ? '🏆' : pct >= 50 ? '🥈' : '🌍';

  const resultTitle = document.querySelector('.result-title');
  if (resultTitle) {
    if (allDone) {
      // Overrides the default "game over" text — drop data-i18n so a later
      // language switch doesn't silently revert it back.
      resultTitle.removeAttribute('data-i18n');
      resultTitle.textContent = t('result_title_alldone', '🎉 Все страны пройдены!');
    } else {
      resultTitle.setAttribute('data-i18n', 'result_title');
      resultTitle.textContent = t('result_title', 'Игра окончена!');
    }
  }

  const RECORD_KEY = 'v1_record';
  const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  localStorage.setItem('v1_last', JSON.stringify({ correct, wrong, total, pct, date }));

  const saved = JSON.parse(localStorage.getItem(RECORD_KEY) || 'null');
  const isNewRecord = !saved || correct > saved.correct;
  if (isNewRecord) {
    localStorage.setItem(RECORD_KEY, JSON.stringify({ correct, wrong, total, pct, date }));
  }

  const banner = document.getElementById('new-record-banner');
  if (banner) banner.style.display = isNewRecord ? 'flex' : 'none';

  const encoded  = encodeResultV1({ correct, wrong, total, pct, date });
  const base     = location.href.replace(/\/[^/]*(\?.*)?$/, '/');
  const shareUrl = document.getElementById('share-url');
  if (shareUrl) shareUrl.value = base + 'result.html#' + encoded;

  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    const freshBtn = copyBtn.cloneNode(true);
    copyBtn.replaceWith(freshBtn);
    freshBtn.addEventListener('click', () => {
      const url = document.getElementById('share-url');
      if (!url) return;
      navigator.clipboard.writeText(url.value).catch(() => {
        url.select(); document.execCommand('copy');
      });
      freshBtn.classList.add('copied');
      setTimeout(() => freshBtn.classList.remove('copied'), 1500);
    });
  }
}

async function startGame() {
  try {
    await getFlagsMap();
  } catch (err) {
    console.warn(err);
  }
  correct = 0; wrong = 0;
  queue   = shuffle(COUNTRIES);
  scoreC.textContent = '0';
  scoreW.textContent = '0';
  show('game');
  startTimer();
  loadQuestion();
}

btnStart?.addEventListener('click', startGame);
btnAgain?.addEventListener('click', startGame);

optBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => handleAnswer(i));
});

document.addEventListener('keydown', e => {
  if (!screens.game.classList.contains('active')) return;
  const map = {'1':0,'2':1,'3':2,'4':3};
  if (e.key in map) handleAnswer(map[e.key]);
});
