'use strict';

// All country data (Russian name, English name, ISO code, flag emoji) comes
// from flags.json — the single source of truth shared with V1/V3. The
// "canonical" identifier used internally throughout this file is the ISO
// country code (e.g. "ru", "fr"), NOT a display name, precisely so the game
// works the same regardless of which language is selected. Until flags.json
// has loaded, these stay empty and getFlagsMap() must be awaited first.
const COUNTRIES = new Set();       // Set of codes, e.g. "ru", "fr", ...
const CODE_TO_ENTRY = new Map();   // code -> { name, name_en, code, emoji }
let flagsMap = null;               // resolves once flags.json is loaded
let optimizeFlags = localStorage.getItem('v2_optimize_flags') === '1';

function getLang() {
  const l = localStorage.getItem('site_lang');
  return (window.__I18N__ && window.__I18N__[l]) ? l : 'ru';
}

function t(key, fallback) {
  const dict = (window.__I18N__ && window.__I18N__[getLang()]) || {};
  return dict[key] !== undefined ? dict[key] : fallback;
}

// Localized display name for a country code in whatever language is active.
function displayName(code) {
  const entry = CODE_TO_ENTRY.get(code);
  if (!entry) return code;
  return getLang() === 'en' ? (entry.name_en || entry.name) : entry.name;
}

async function getFlagsMap() {
  if (flagsMap) return flagsMap;
  const res = await fetch('flags.json', { cache: 'force-cache' });
  if (!res.ok) throw new Error('Не удалось загрузить flags.json');
  const flags = await res.json();
  flagsMap = new Map(flags.map(f => [f.code, f]));
  flags.forEach(f => {
    COUNTRIES.add(f.code);
    CODE_TO_ENTRY.set(f.code, f);
  });
  buildCountryLookup();
  return flagsMap;
}

// Windows-based browsers have no flag glyphs in the system emoji font, so a
// flag emoji renders as plain letters instead of a flag. Twemoji SVGs render
// the same tiny flag image on every platform.
function emojiToTwemojiUrl(emoji) {
  const codepoints = [...emoji]
    .map(ch => ch.codePointAt(0).toString(16))
    .filter(cp => cp !== 'fe0f')
    .join('-');
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`;
}

function createCountryFlagNode(code) {
  if (optimizeFlags) {
    const emoji = CODE_TO_ENTRY.get(code)?.emoji || '🏳️';
    const img = document.createElement('img');
    img.className = 'country-flag-emoji';
    img.src = emojiToTwemojiUrl(emoji);
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    return img;
  }

  if (!code) return null;
  const img = document.createElement('img');
  img.className = 'country-flag';
  img.src = `https://flagcdn.com/w40/${code}.png`;
  img.srcset = `https://flagcdn.com/w80/${code}.png 2x`;
  img.alt = '';
  img.loading = 'lazy';
  img.decoding = 'async';
  return img;
}

// `code` is the canonical ISO country code; the visible label is always
// resolved through displayName() so it follows the current site language.
function fillCountryTag(tag, code) {
  const flag = createCountryFlagNode(code);
  if (flag) tag.appendChild(flag);
  const text = document.createElement('span');
  text.textContent = displayName(code);
  tag.appendChild(text);
}

// Russian aliases/spelling variants, keyed by ISO code.
const ALIASES_RU = {
  ru: ["рф", "российская федерация"],
  us: ["сша", "америка", "соединённые штаты", "соединенные штаты", "штаты"],
  gb: ["великобритания", "британия", "англия", "великая британия", "uk"],
  ae: ["оаэ", "объединённые арабские эмираты", "объединенные арабские эмираты", "эмираты"],
  cd: ["дрк", "демократическая республика конго", "конго-киншаса", "заир"],
  za: ["юар", "южная африка"],
  cf: ["цар", "центральноафриканская республика"],
  cz: ["чехия", "чешская республика", "чехословакия"],
  kp: ["северная корея", "кндр"],
  kr: ["южная корея", "корея"],
  mm: ["мьянма", "бирма"],
  sz: ["эсватини", "свазиленд"],
  mk: ["северная македония", "македония"],
  tl: ["восточный тимор", "тимор-лесте"],
  pg: ["папуа новая гвинея", "папуа-новая гвинея"],
  ci: ["кот д'ивуар", "кот дивуар", "берег слоновой кости"],
  ba: ["босния", "герцеговина"],
  tt: ["тринидад"],
  ag: ["антигуа"],
  kn: ["сент китс", "сент-китс"],
  vc: ["сент винсент", "сент-винсент"],
  st: ["сан томе", "сан-томе"],
  sb: ["соломоновы острова"],
  mh: ["маршалловы острова"],
  fm: ["федеративные штаты микронезии"],
  ps: ["палестинская автономия"],
  nl: ["голландия"],
  by: ["белоруссия"],
  md: ["молдавия"],
  kg: ["киргизия", "киргизстан"],
};

// English aliases/spelling variants, keyed by ISO code. This is what lets
// people type country names in English in the text/voice modes.
const ALIASES_EN = {
  ru: ["russian federation"],
  us: ["usa", "america", "united states", "united states of america", "the states"],
  gb: ["uk", "britain", "great britain", "england", "united kingdom of great britain"],
  ae: ["uae", "emirates", "united arab emirates"],
  cd: ["drc", "democratic republic of congo", "democratic republic of the congo", "congo kinshasa", "zaire"],
  cg: ["congo brazzaville", "republic of congo"],
  za: ["south africa", "rsa"],
  cf: ["car", "central african republic"],
  cz: ["czech republic", "czechoslovakia"],
  kp: ["north korea", "dprk"],
  kr: ["south korea", "korea"],
  mm: ["burma"],
  sz: ["swaziland"],
  mk: ["macedonia"],
  tl: ["east timor", "timor leste"],
  pg: ["papua new guinea"],
  ci: ["cote d'ivoire", "cote divoire", "ivory coast"],
  ba: ["bosnia", "herzegovina", "bosnia and herzegovina"],
  tt: ["trinidad"],
  ag: ["antigua"],
  kn: ["st kitts", "saint kitts"],
  vc: ["st vincent", "saint vincent"],
  st: ["sao tome"],
  sb: ["solomon islands"],
  mh: ["marshall islands"],
  fm: ["micronesia", "federated states of micronesia"],
  ps: ["palestine", "palestinian territories"],
  nl: ["holland"],
  by: ["belarus"],
  md: ["moldova"],
  kg: ["kyrgyzstan", "kirghizia"],
};

const COUNTRY_LOOKUP = new Map(); // normalized phrase (ru or en) -> country code
let MAX_COUNTRY_WORDS = 1;
let lookupBuilt = false;

function normalizeText(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[—–-]/g, ' ')
    .replace(/[^a-zа-я0-9\s']/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function registerCountryPhrase(phrase, code) {
  const normalized = normalizeText(phrase);
  if (!normalized || !COUNTRIES.has(code)) return;
  COUNTRY_LOOKUP.set(normalized, code);
  MAX_COUNTRY_WORDS = Math.max(MAX_COUNTRY_WORDS, normalized.split(' ').length);
}

// Registers both the Russian and English name/aliases for every country, so
// answers can be matched (and spoken/typed) in either language regardless of
// which language the UI is currently showing.
function buildCountryLookup() {
  if (lookupBuilt) return;
  lookupBuilt = true;

  for (const code of COUNTRIES) {
    const entry = CODE_TO_ENTRY.get(code);
    if (!entry) continue;
    registerCountryPhrase(entry.name, code);
    if (entry.name_en) registerCountryPhrase(entry.name_en, code);
  }

  for (const [code, aliases] of Object.entries(ALIASES_RU)) {
    aliases.forEach(a => registerCountryPhrase(a, code));
  }
  for (const [code, aliases] of Object.entries(ALIASES_EN)) {
    aliases.forEach(a => registerCountryPhrase(a, code));
  }
}

function matchCountry(raw) {
  const normalized = normalizeText(raw);
  if (!normalized) return null;
  return COUNTRY_LOOKUP.get(normalized) || null;
}

function extractCountriesFromSpeech(raw) {
  const normalized = normalizeText(raw);
  if (!normalized) return { countries: [], unknown: [] };

  const words = normalized.split(' ');
  const countries = [];
  const unknown = [];
  let i = 0;

  while (i < words.length) {
    let found = null;
    let foundLen = 0;

    for (let len = Math.min(MAX_COUNTRY_WORDS, words.length - i); len > 0; len--) {
      const phrase = words.slice(i, i + len).join(' ');
      if (COUNTRY_LOOKUP.has(phrase)) {
        found = COUNTRY_LOOKUP.get(phrase);
        foundLen = len;
        break;
      }
    }

    if (found) {
      countries.push(found);
      i += foundLen;
    } else {
      unknown.push(words[i]);
      i += 1;
    }
  }

  return { countries, unknown };
}

const TOTAL_COUNTRIES = 195;
const DURATION_SECS   = 10 * 60;
const CIRCUMFERENCE   = 2 * Math.PI * 50;
const RECORD_KEYS     = { text: 'v2_record_text', voice: 'v2_record_voice' };

function encodeResultV2(data) {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeResultV2(encoded) {
  const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

let answered   = new Set();
let timeLeft   = DURATION_SECS;
let timerInterval = null;
let timerFrame = null;
let timerDeadline = 0;
let gameActive = false;
let gameEnded = false;
let currentMode = 'text';
let recognition = null;
let voiceWanted = false;
let voiceSupported = false;
let restartVoiceTimer = null;

const screens = {
  start:  document.getElementById('start-screen'),
  game:   document.getElementById('game-screen'),
  result: document.getElementById('result-screen'),
};
const countCorrectEl  = document.getElementById('count-correct');
const pctValEl        = document.getElementById('pct-val');
const timerTextEl     = document.getElementById('timer-text');
const ringFillEl      = document.getElementById('ring-fill');
const progressFillEl  = document.getElementById('progress-fill');
const inputEl         = document.getElementById('country-input');
const submitBtn       = document.getElementById('submit-btn');
const micBtn          = document.getElementById('mic-btn');
const voiceStatusEl   = document.getElementById('voice-status');
const feedbackEl      = document.getElementById('feedback-toast');
const answeredHeader  = document.getElementById('answered-header');
const answeredGrid    = document.getElementById('answered-grid');

const resCorrectEl    = document.getElementById('res-correct');
const resPctEl        = document.getElementById('res-pct');
const resultTitleEl   = document.getElementById('result-title');
const resultSubEl     = document.getElementById('result-subtitle');
const resultTrophyEl  = document.getElementById('result-trophy');
const resultTagsEl    = document.getElementById('result-tags');
const shareUrlEl      = document.getElementById('share-url');
const copyBtnEl       = document.getElementById('copy-btn');
const gameModeBadge   = document.getElementById('game-mode-badge');
const voiceBigIconEl  = document.getElementById('voice-big-icon');
const optimizeToggle   = document.getElementById('optimize-flags-v2');

if (optimizeToggle) {
  optimizeToggle.checked = optimizeFlags;
  optimizeToggle.addEventListener('change', () => {
    optimizeFlags = optimizeToggle.checked;
    localStorage.setItem('v2_optimize_flags', optimizeFlags ? '1' : '0');
  });
}

const btnStartText  = document.getElementById('btn-start-text');
const btnStartVoice = document.getElementById('btn-start-voice');
const btnAgain      = document.getElementById('btn-again');

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
  const frac = secs / DURATION_SECS;
  const offset = CIRCUMFERENCE * (1 - frac);
  ringFillEl.style.strokeDashoffset = offset;
  ringFillEl.style.stroke =
    frac > .5 ? 'url(#timerGradV2)' :
    frac > .2 ? '#f5c842' : '#f4536a';
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
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

  if (msLeft <= 0) {
    endGame(false);
    return;
  }

  timerFrame = requestAnimationFrame(tickTimer);
}

function startTimer() {
  stopTimer();
  timerDeadline = Date.now() + DURATION_SECS * 1000;
  renderTimer(DURATION_SECS);
  timerFrame = requestAnimationFrame(tickTimer);
}

function updateStats() {
  const n = answered.size;
  const pct = Math.round(n / TOTAL_COUNTRIES * 100);
  countCorrectEl.textContent = n;
  pctValEl.textContent = pct + '%';
  progressFillEl.style.width = pct + '%';
  answeredHeader.textContent = `${t('answered_header_prefix', 'Принятые страны')} (${n})`;
}

// `code` is the canonical ISO country code — fillCountryTag() resolves it to
// the localized display name at render time.
function addTag(code) {
  const tag = document.createElement('span');
  tag.className = 'answered-tag';
  tag.dataset.code = code;
  fillCountryTag(tag, code);
  answeredGrid.appendChild(tag);
  const section = answeredGrid.closest('.answered-section');
  section.scrollTop = section.scrollHeight;
}

// Re-renders every already-answered tag's label/flag in the current
// language. Called on 'langchange' so a mid-game language switch updates
// the whole accepted-countries list immediately instead of just new tags.
function relabelAnsweredTags() {
  answeredGrid.querySelectorAll('.answered-tag').forEach(tag => {
    const code = tag.dataset.code;
    if (!code) return;
    tag.innerHTML = '';
    fillCountryTag(tag, code);
  });
  updateStats();
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

function renderOneRecord(mode) {
  const saved = JSON.parse(localStorage.getItem(RECORD_KEYS[mode]) || 'null');
  const countEl = document.getElementById(`record-count-${mode}`);
  const subEl = document.getElementById(`record-sub-${mode}`);

  if (!countEl || !subEl) return;

  if (saved) {
    countEl.textContent = saved.count + ' ' + t('record_countries_suffix', 'стран');
    subEl.textContent = saved.pct + t('record_pct_suffix', '% от всех · ') + saved.date;
  } else {
    countEl.textContent = '—';
    subEl.textContent = t('record_empty', 'Сыграй первую партию!');
  }
}

function renderStartRecord() {
  renderOneRecord('text');
  renderOneRecord('voice');
}

function saveRecord(count, pct) {
  const key = RECORD_KEYS[currentMode] || RECORD_KEYS.text;
  const saved = JSON.parse(localStorage.getItem(key) || 'null');
  const isNew = !saved || count > saved.count;
  const banner = document.getElementById('new-record-banner');

  if (isNew) {
    const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    localStorage.setItem(key, JSON.stringify({ count, pct, date }));
    banner.textContent = currentMode === 'voice'
      ? t('new_record_voice', '🎉 Новый рекорд голосовой игры!')
      : t('new_record_text', '🎉 Новый рекорд текстовой игры!');
    banner?.classList.add('show');
  } else {
    banner?.classList.remove('show');
  }
}

function flashInput(className, ms = 320) {
  inputEl.classList.add(className);
  setTimeout(() => inputEl.classList.remove(className), ms);
}

function addCountry(raw, source = 'typed') {
  if (!gameActive || gameEnded) return { status: 'inactive' };

  const canonical = matchCountry(raw);

  if (!canonical) {
    if (source === 'typed') {
      flashInput('shake');
      showFeedback(t('feedback_unknown', '❌ Неизвестная страна'), 'err');
    }
    return { status: 'unknown', raw };
  }

  if (answered.has(canonical)) {
    if (source === 'typed') {
      flashInput('shake');
      showFeedback(`🔁 «${displayName(canonical)}» ${t('feedback_dup_suffix', 'уже есть!')}`, 'dup');
      inputEl.value = '';
    }
    return { status: 'duplicate', canonical };
  }

  answered.add(canonical);
  addTag(canonical);
  updateStats();

  flashInput('glow-correct', 400);
  if (source === 'typed') {
    showFeedback(`✓ ${displayName(canonical)}`, 'ok');
    inputEl.value = '';
  }

  if (answered.size >= TOTAL_COUNTRIES) {
    endGame(true);
  }

  return { status: 'added', canonical };
}

function handleSubmit() {
  if (currentMode !== 'text') return;
  const result = addCountry(inputEl.value, 'typed');
  if (result.status === 'added' || result.status === 'duplicate') inputEl.value = '';
}

function handleSpeechText(text) {
  if (!gameActive || gameEnded) return;

  const { countries, unknown } = extractCountriesFromSpeech(text);
  let added = 0;
  let duplicated = 0;

  for (const country of countries) {
    const result = addCountry(country, 'voice');
    if (result.status === 'added') added++;
    if (result.status === 'duplicate') duplicated++;
  }

  if (countries.length) {
    inputEl.value = '';
    const parts = [];
    if (added) parts.push(`✓ ${t('voice_added', 'добавлено')}: ${added}`);
    if (duplicated) parts.push(`🔁 ${t('voice_duplicated', 'уже были')}: ${duplicated}`);
    if (unknown.length) parts.push(`${t('voice_unrecognized', 'не распознано')}: ${unknown.length}`);
    showFeedback(parts.join(' · '), added ? 'ok' : 'dup');
    setVoiceStatus(`🎙️ ${t('voice_listening', 'Слушаю')}... ${parts.join(' · ')}`, 'listening');
  } else if (unknown.length) {
    setVoiceStatus(`🎙️ ${t('voice_listening', 'Слушаю')}... ${t('voice_none_found', 'стран не найдено')}`, 'err');
  }
}

function applyGameMode(mode) {
  currentMode = mode === 'voice' ? 'voice' : 'text';
  screens.game.classList.toggle('mode-voice', currentMode === 'voice');
  screens.game.classList.toggle('mode-text', currentMode === 'text');

  if (gameModeBadge) {
    gameModeBadge.textContent = currentMode === 'voice'
      ? t('mode_voice_badge', '🎙️ Голосовая игра')
      : t('mode_text_badge', '⌨️ Текстовая игра');
  }

  if (inputEl) {
    inputEl.disabled = currentMode !== 'text';
    inputEl.value = '';
  }
  if (submitBtn) submitBtn.disabled = currentMode !== 'text';

  setVoiceStatus(
    currentMode === 'voice'
      ? t('voice_requesting', 'Запрашиваю доступ к микрофону...')
      : t('voice_text_only', 'Голосовой ввод доступен только в отдельной голосовой игре')
  );
}

async function startGame(mode = currentMode || 'text') {
  try { await getFlagsMap(); } catch (err) { console.warn(err); }
  stopVoiceInput();
  stopTimer();
  applyGameMode(mode);
  answered.clear();
  answeredGrid.innerHTML = '';
  resultTagsEl.innerHTML = '';
  inputEl.value = '';
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback-toast';
  gameEnded = false;
  gameActive = true;
  updateStats();
  showScreen('game');
  startTimer();

  if (currentMode === 'voice') {
    setTimeout(startVoiceInput, 250);
  } else {
    setTimeout(() => inputEl.focus(), 100);
  }
}

function endGame(allDone = false) {
  if (gameEnded) return;
  gameEnded = true;
  gameActive = false;
  stopVoiceInput();
  stopTimer();
  renderTimer(0);
  inputEl.disabled = true;
  submitBtn.disabled = true;
  showScreen('result');

  const n = answered.size;
  const pct = Math.round(n / TOTAL_COUNTRIES * 100);

  resCorrectEl.textContent = n;
  resPctEl.textContent = pct + '%';
  saveRecord(n, pct);

  let trophy, title, subtitle;
  if (allDone) {
    trophy = '🌍'; title = t('rt_all', 'Все страны!'); subtitle = t('rs_all', 'Невероятный результат! Ты знаешь все 195 стран мира!');
  } else if (pct >= 70) {
    trophy = '🏆'; title = t('rt_70', 'Легенда географии!'); subtitle = `${n} ${t('rs_70', 'стран — это потрясающе! Ты настоящий эксперт.')}`;
  } else if (pct >= 50) {
    trophy = '🥇'; title = t('rt_50', 'Отличный результат!'); subtitle = `${n} ${t('rs_50', 'стран из 195 — больше половины! Достойно.')}`;
  } else if (pct >= 30) {
    trophy = '🥈'; title = t('rt_30', 'Хороший результат!'); subtitle = `${n} ${t('rs_30', 'стран — неплохо, но есть куда расти!')}`;
  } else if (pct >= 15) {
    trophy = '🌐'; title = t('rt_15', 'Неплохое начало!'); subtitle = `${n} ${t('rs_15', 'стран — попробуй ещё раз, ты можешь лучше!')}`;
  } else {
    trophy = '🗺️'; title = t('rt_0', 'Время вышло!'); subtitle = `${n} ${t('rs_0', 'стран — в следующий раз узнаешь больше!')}`;
  }

  resultTrophyEl.textContent = trophy;
  resultTitleEl.textContent  = title;
  resultSubEl.textContent    = (currentMode === 'voice' ? t('mode_voice_prefix', 'Голосовая игра · ') : t('mode_text_prefix', 'Текстовая игра · ')) + subtitle;

  resultTagsEl.innerHTML = '';
  const lang = getLang();
  const sorted = [...answered].sort((a, b) => displayName(a).localeCompare(displayName(b), lang));
  for (const c of sorted) {
    const tag = document.createElement('span');
    tag.className = 'result-tag';
    tag.dataset.code = c;
    fillCountryTag(tag, c);
    resultTagsEl.appendChild(tag);
  }

  const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  const encoded = encodeResultV2({ mode: currentMode, n, pct, total: TOTAL_COUNTRIES, date });
  const base = location.href.replace(/\/[^/]*$/, '/');
  shareUrlEl.value = base + 'v2.html#' + encoded;
}

function setVoiceStatus(text, state = '') {
  if (!voiceStatusEl) return;
  voiceStatusEl.textContent = text;
  voiceStatusEl.className = state ? `voice-status ${state}` : 'voice-status';
}

function setMicButton(active) {
  if (!micBtn) return;
  micBtn.classList.toggle('listening', active);
  micBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
  const label = micBtn.querySelector('.mic-label');
  if (label) label.textContent = active ? 'Слушаю' : 'Включить';
  if (voiceBigIconEl) voiceBigIconEl.classList.toggle('listening', active);
}

function initVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    voiceSupported = false;
    micBtn?.classList.add('unsupported');
    if (micBtn) micBtn.disabled = true;
    setVoiceStatus('Голосовой ввод не поддерживается в этом браузере', 'err');
    return;
  }

  voiceSupported = true;
  recognition = new SpeechRecognition();
  recognition.lang = 'ru-RU';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    setMicButton(true);
    setVoiceStatus('🎙️ Слушаю... говори страны подряд', 'listening');
  };

  recognition.onresult = event => {
    let interim = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const text = event.results[i][0]?.transcript || '';

      if (event.results[i].isFinal) {
        handleSpeechText(text);
      } else {
        interim += text;
      }
    }

    if (interim.trim()) {
      setVoiceStatus('🎙️ Слышу: ' + interim.trim(), 'listening');
    }
  };

  recognition.onerror = event => {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      voiceWanted = false;
      setMicButton(false);
      setVoiceStatus('Доступ к микрофону запрещён', 'err');
      return;
    }

    if (voiceWanted && gameActive && !gameEnded) {
      setVoiceStatus('🎙️ Перезапускаю микрофон...', 'listening');
    } else {
      setVoiceStatus('Ошибка голосового ввода: ' + event.error, 'err');
    }
  };

  recognition.onend = () => {
    setMicButton(false);
    clearTimeout(restartVoiceTimer);

    if (voiceWanted && gameActive && !gameEnded) {
      restartVoiceTimer = setTimeout(() => {
        try { recognition.start(); } catch (_) {}
      }, 250);
    } else if (!gameActive || gameEnded) {
      setVoiceStatus('Голосовой ввод выключен');
    }
  };
}

function startVoiceInput() {
  if (!voiceSupported || !recognition) {
    setVoiceStatus('Голосовой ввод не поддерживается в этом браузере', 'err');
    return;
  }
  if (!gameActive || gameEnded) return;
  voiceWanted = true;
  try {
    recognition.start();
  } catch (_) {
    setVoiceStatus('🎙️ Микрофон уже включается...', 'listening');
  }
}

function stopVoiceInput() {
  voiceWanted = false;
  clearTimeout(restartVoiceTimer);
  restartVoiceTimer = null;
  setMicButton(false);
  if (recognition) {
    try { recognition.stop(); } catch (_) {}
  }
  setVoiceStatus('Голосовой ввод выключен');
}

function toggleVoiceInput() {
  if (!voiceSupported) {
    setVoiceStatus('Голосовой ввод не поддерживается в этом браузере', 'err');
    return;
  }
  if (!gameActive || gameEnded) {
    setVoiceStatus('Сначала начни игру', 'err');
    return;
  }
  if (currentMode !== 'voice') {
    setVoiceStatus('Микрофон работает только в голосовой игре', 'err');
    return;
  }
  if (voiceWanted) stopVoiceInput();
  else startVoiceInput();
}

btnStartText?.addEventListener('click', () => startGame('text'));
btnStartVoice?.addEventListener('click', () => startGame('voice'));
btnAgain?.addEventListener('click', () => startGame(currentMode));
submitBtn?.addEventListener('click', handleSubmit);
micBtn?.addEventListener('click', toggleVoiceInput);

inputEl?.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleSubmit();
});

copyBtnEl?.addEventListener('click', () => {
  const val = shareUrlEl.value;
  if (!val) return;
  navigator.clipboard.writeText(val).catch(() => {
    shareUrlEl.select(); document.execCommand('copy');
  });
  copyBtnEl.classList.add('copied');
  setTimeout(() => copyBtnEl.classList.remove('copied'), 1500);
});

initVoiceInput();
renderStartRecord();

document.addEventListener('langchange', () => {
  relabelAnsweredTags();
  renderStartRecord();
  if (gameActive && !gameEnded) applyGameMode(currentMode);
});

function renderSharedResult(data) {
  const { mode, n, pct, total, date } = data;
  const totalCount = total || TOTAL_COUNTRIES;
  const computedPct = typeof pct === 'number' ? pct : Math.round((n / totalCount) * 100);

  resCorrectEl.textContent = n;
  resPctEl.textContent = computedPct + '%';
  resultTrophyEl.textContent =
    computedPct >= 70 ? '🏆' : computedPct >= 50 ? '🥇' : computedPct >= 30 ? '🥈' : '🌍';
  resultTitleEl.textContent = t('friend_result', 'Результат друга');
  const modeLabel = mode === 'voice' ? t('mode_voice_short_plain', 'Голосовая игра') : t('mode_text_short_plain', 'Текстовая игра');
  resultSubEl.textContent =
    `${modeLabel} · ${n} ${t('record_countries_suffix', 'стран')} ${t('record_out_of_prep', 'из')} ${totalCount}` +
    (date ? ` · ${date}` : '');

  resultTagsEl.innerHTML = '';
  const note = document.createElement('p');
  note.className = 'hero-sub';
  note.style.opacity = '.6';
  note.textContent = t('friend_result_note', 'Список названных стран виден только в браузере автора результата.');
  resultTagsEl.appendChild(note);

  document.getElementById('new-record-banner')?.classList.remove('show');
  shareUrlEl.value = location.href;
  showScreen('result');
}

(function initFromShareV2() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  try {
    const data = decodeResultV2(hash);
    if (data && typeof data.n === 'number') renderSharedResult(data);
  } catch (e) {

  }
})();
