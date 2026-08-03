'use strict';

const MODES = {
  ru: {
    key: 'ru',
    flag: '🇷🇺',
    title: 'Регионы России',
    subtitle: 'Впиши как можно больше регионов России за 10 минут. Каждый угаданный регион подсвечивается на карте.',
    total: 85,
    duration: 10 * 60,
    noun: 'регионов',
    recordKey: 'v4_record_ru',
  },
  us: {
    key: 'us',
    flag: '🇺🇸',
    title: 'Штаты США',
    subtitle: 'Впиши как можно больше штатов США за 7 минут. Каждый угаданный штат подсвечивается на карте.',
    total: 51,
    duration: 7 * 60,
    noun: 'штатов',
    recordKey: 'v4_record_us',
  },
  ua: {
    key: 'ua',
    flag: '🇺🇦',
    title: 'Области Украины',
    subtitle: 'Впиши как можно больше областей Украины за 5 минут. Каждая угаданная область подсвечивается на карте.',
    total: 27,
    duration: 5 * 60,
    noun: 'областей',
    recordKey: 'v4_record_ua',
  },
};

const CIRCUMFERENCE = 2 * Math.PI * 50;

function normalizeText(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[—–'-]/g, ' ')
    .replace(/[^a-zа-яіїєґ0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

let currentMode = null;
let currentRegions = [];
let regionLookup = new Map();
let regionById = new Map();

let answered = new Set();
let timeLeft = 0;
let timerFrame = null;
let timerDeadline = 0;
let gameActive = false;
let gameEnded = false;

const screens = {
  select: document.getElementById('select-screen'),
  game:   document.getElementById('game-screen'),
  result: document.getElementById('result-screen'),
};

const countCorrectEl  = document.getElementById('count-correct');
const pctValEl        = document.getElementById('pct-val');
const timerTextEl     = document.getElementById('timer-text');
const ringFillEl      = document.getElementById('ring-fill');
const progressFillEl  = document.getElementById('progress-fill');
const inputEl         = document.getElementById('region-input');
const submitBtn       = document.getElementById('submit-btn');
const feedbackEl      = document.getElementById('feedback-toast');
const answeredHeader  = document.getElementById('answered-header');
const answeredGrid    = document.getElementById('answered-grid');
const mapHolder       = document.getElementById('map-holder');
const gameModeLabel   = document.getElementById('game-mode-label');

const resCorrectEl    = document.getElementById('res-correct');
const resPctEl        = document.getElementById('res-pct');
const resultTitleEl   = document.getElementById('result-title');
const resultSubEl     = document.getElementById('result-subtitle');
const resultTrophyEl  = document.getElementById('result-trophy');
const resultTagsEl    = document.getElementById('result-tags');

const btnAgain  = document.getElementById('btn-again');
const btnGiveUp = document.getElementById('btn-giveup');
const btnBack   = document.getElementById('btn-back-select');
const btnBack2  = document.getElementById('btn-back-select-2');

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateRing(secs) {
  const frac = secs / currentMode.duration;
  const offset = CIRCUMFERENCE * (1 - frac);
  ringFillEl.style.strokeDashoffset = offset;
  ringFillEl.style.stroke =
    frac > .5 ? 'url(#timerGradV4)' :
    frac > .2 ? '#f5c842' : '#f4536a';
}

function stopTimer() {
  if (timerFrame) cancelAnimationFrame(timerFrame);
  timerFrame = null;
}

function renderTimer(secs) {
  timeLeft = Math.max(0, secs);
  timerTextEl.textContent = formatTime(timeLeft);
  updateRing(timeLeft);
}

function tickTimer() {
  if (!gameActive || gameEnded) return;
  const msLeft = Math.max(0, timerDeadline - Date.now());
  const secsLeft = Math.ceil(msLeft / 1000);
  renderTimer(secsLeft);
  if (msLeft <= 0) { endGame(false); return; }
  timerFrame = requestAnimationFrame(tickTimer);
}

function startTimer() {
  stopTimer();
  timerDeadline = Date.now() + currentMode.duration * 1000;
  renderTimer(currentMode.duration);
  timerFrame = requestAnimationFrame(tickTimer);
}

function updateStats() {
  const n = answered.size;
  const pct = Math.round(n / currentMode.total * 100);
  countCorrectEl.textContent = n;
  pctValEl.textContent = n + ' / ' + currentMode.total;
  progressFillEl.style.width = pct + '%';
  answeredHeader.textContent = `Введено (${n})`;
}

function addTag(id) {
  const region = regionById.get(id);
  const tag = document.createElement('span');
  tag.className = 'answered-tag';
  tag.dataset.id = id;
  tag.textContent = region.name;
  answeredGrid.appendChild(tag);
  const section = answeredGrid.closest('.answered-section');
  section.scrollTop = section.scrollHeight;
}

let feedbackTimer = null;
function showFeedback(msg, type) {
  feedbackEl.textContent = msg;
  feedbackEl.className = `feedback-toast ${type}`;
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback-toast';
  }, 1800);
}

function flashInput(className, ms = 320) {
  inputEl.classList.add(className);
  setTimeout(() => inputEl.classList.remove(className), ms);
}

function highlightTile(id) {
  const mapSvg = mapHolder.querySelector('svg');
  const tile = mapSvg && mapSvg.querySelector(`#${CSS.escape(id)}`);
  if (tile) tile.classList.add('filled');
}

function matchRegion(raw) {
  const normalized = normalizeText(raw);
  if (!normalized) return null;
  return regionLookup.get(normalized) || null;
}

function addRegion(raw) {
  if (!gameActive || gameEnded) return;
  const id = matchRegion(raw);

  if (!id) {
    flashInput('shake');
    showFeedback('❌ Не найдено', 'err');
    return;
  }
  if (answered.has(id)) {
    flashInput('shake');
    showFeedback(`🔁 «${regionById.get(id).name}» уже есть!`, 'dup');
    inputEl.value = '';
    return;
  }

  answered.add(id);
  addTag(id);
  highlightTile(id);
  updateStats();
  flashInput('glow-correct', 400);
  showFeedback(`✓ ${regionById.get(id).name}`, 'ok');
  inputEl.value = '';

  if (answered.size >= currentMode.total) endGame(true);
}

function handleSubmit() {
  addRegion(inputEl.value);
}

function renderRecordBadges() {
  Object.values(MODES).forEach(mode => {
    const el = document.getElementById('record-' + mode.key);
    if (!el) return;
    const saved = JSON.parse(localStorage.getItem(mode.recordKey) || 'null');
    el.textContent = saved ? `Рекорд: ${saved.count}/${mode.total}` : 'Ещё не сыграно';
  });
}

function saveRecord(mode, count, pct) {
  const saved = JSON.parse(localStorage.getItem(mode.recordKey) || 'null');
  const isNew = !saved || count > saved.count;
  const banner = document.getElementById('new-record-banner');
  if (isNew) {
    const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    localStorage.setItem(mode.recordKey, JSON.stringify({ count, pct, date }));
    banner?.classList.add('show');
  } else {
    banner?.classList.remove('show');
  }
}

function loadMode(modeKey) {
  currentMode = MODES[modeKey];
  currentRegions = DATASETS[modeKey];
  regionLookup = new Map();
  regionById = new Map();
  currentRegions.forEach(r => {
    regionById.set(r.id, r);
    r.match.forEach(phrase => {
      const n = normalizeText(phrase);
      if (n) regionLookup.set(n, r.id);
    });
    regionLookup.set(normalizeText(r.name), r.id);
  });
  mapHolder.innerHTML = MAPS[modeKey];
}

function startGame(modeKey) {
  loadMode(modeKey);
  stopTimer();
  answered.clear();
  answeredGrid.innerHTML = '';
  resultTagsEl.innerHTML = '';
  inputEl.value = '';
  inputEl.disabled = false;
  submitBtn.disabled = false;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback-toast';
  gameEnded = false;
  gameActive = true;
  gameModeLabel.textContent = `${currentMode.flag} ${currentMode.title}`;
  updateStats();
  showScreen('game');
  startTimer();
  setTimeout(() => inputEl.focus(), 100);
}

function endGame(allDone = false) {
  if (gameEnded) return;
  gameEnded = true;
  gameActive = false;
  stopTimer();
  renderTimer(0);
  inputEl.disabled = true;
  submitBtn.disabled = true;
  showScreen('result');

  const n = answered.size;
  const pct = Math.round(n / currentMode.total * 100);
  resCorrectEl.textContent = n;
  resPctEl.textContent = pct + '%';
  saveRecord(currentMode, n, pct);

  let trophy, title, subtitle;
  if (allDone) {
    trophy = currentMode.flag; title = `Все ${currentMode.noun}!`; subtitle = `Невероятный результат! Ты знаешь все ${currentMode.total} ${currentMode.noun}!`;
  } else if (pct >= 70) {
    trophy = '🏆'; title = 'Легенда географии!'; subtitle = `${n} ${currentMode.noun} — это потрясающе! Ты настоящий эксперт.`;
  } else if (pct >= 50) {
    trophy = '🥇'; title = 'Отличный результат!'; subtitle = `${n} из ${currentMode.total} — больше половины! Достойно.`;
  } else if (pct >= 30) {
    trophy = '🥈'; title = 'Хороший результат!'; subtitle = `${n} ${currentMode.noun} — неплохо, но есть куда расти!`;
  } else if (pct >= 15) {
    trophy = '🌐'; title = 'Неплохое начало!'; subtitle = `${n} ${currentMode.noun} — попробуй ещё раз, ты можешь лучше!`;
  } else {
    trophy = '🗺️'; title = 'Время вышло!'; subtitle = `${n} ${currentMode.noun} — в следующий раз узнаешь больше!`;
  }

  resultTrophyEl.textContent = trophy;
  resultTitleEl.textContent  = title;
  resultSubEl.textContent    = subtitle;

  resultTagsEl.innerHTML = '';
  const sorted = [...answered].map(id => regionById.get(id)).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  for (const r of sorted) {
    const tag = document.createElement('span');
    tag.className = 'result-tag';
    tag.textContent = r.name;
    resultTagsEl.appendChild(tag);
  }
}

document.querySelectorAll('[data-start-mode]').forEach(btn => {
  btn.addEventListener('click', () => startGame(btn.dataset.startMode));
});

btnAgain?.addEventListener('click', () => startGame(currentMode.key));
btnGiveUp?.addEventListener('click', () => endGame(false));
btnBack?.addEventListener('click', () => { stopTimer(); showScreen('select'); renderRecordBadges(); });
btnBack2?.addEventListener('click', () => { showScreen('select'); renderRecordBadges(); });
submitBtn?.addEventListener('click', handleSubmit);
inputEl?.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleSubmit();
});

renderRecordBadges();
