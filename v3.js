'use strict';

function getLang() {
  const l = localStorage.getItem('site_lang');
  return (window.__I18N__ && window.__I18N__[l]) ? l : 'ru';
}

function t(key, fallback) {
  const dict = (window.__I18N__ && window.__I18N__[getLang()]) || {};
  return dict[key] !== undefined ? dict[key] : fallback;
}

// Russian aliases/spelling variants, keyed by ISO code.
const ALIASES_RU = {
  ru: ['рф', 'российская федерация'],
  us: ['сша', 'америка', 'соединенные штаты', 'соединённые штаты'],
  gb: ['британия', 'англия', 'великая британия', 'uk'],
  ae: ['оаэ', 'объединенные арабские эмираты', 'объединённые арабские эмираты', 'эмираты'],
  cd: ['дрк', 'демократическая республика конго', 'конго киншаса', 'заир'],
  za: ['юар', 'южная африка'],
  cf: ['цар', 'центральноафриканская республика'],
  cz: ['чешская республика'],
  kp: ['кндр'],
  kr: ['корея'],
  mm: ['бирма'],
  sz: ['свазиленд'],
  mk: ['македония'],
  tl: ['тимор лесте'],
  pg: ['папуа новая гвинея'],
  ci: ['кот дивуар', 'берег слоновой кости'],
  ba: ['босния'],
  nl: ['голландия'],
  by: ['белоруссия'],
  md: ['молдавия'],
  kg: ['киргизия', 'киргизстан'],
};

// English aliases/spelling variants, keyed by ISO code — lets people type
// country names in English too.
const ALIASES_EN = {
  ru: ['russian federation'],
  us: ['usa', 'america', 'united states', 'united states of america'],
  gb: ['uk', 'britain', 'great britain', 'england'],
  ae: ['uae', 'emirates', 'united arab emirates'],
  cd: ['drc', 'democratic republic of congo', 'democratic republic of the congo', 'congo kinshasa', 'zaire'],
  cg: ['congo brazzaville', 'republic of congo'],
  za: ['south africa', 'rsa'],
  cf: ['car', 'central african republic'],
  cz: ['czech republic'],
  kp: ['north korea', 'dprk'],
  kr: ['south korea', 'korea'],
  mm: ['burma'],
  sz: ['swaziland'],
  mk: ['macedonia'],
  tl: ['east timor', 'timor leste'],
  pg: ['papua new guinea'],
  ci: ["cote d'ivoire", 'cote divoire', 'ivory coast'],
  ba: ['bosnia', 'herzegovina', 'bosnia and herzegovina'],
  nl: ['holland'],
  by: ['belarus'],
  md: ['moldova'],
  kg: ['kyrgyzstan', 'kirghizia'],
};

let countries = [];
let deck = [];
let index = 0;
let correct = 0;
let wrong = 0;
let skipped = 0;
let active = false;
let optimizeFlags = localStorage.getItem('v3_optimize_flags') === '1';

// normalized phrase (ru or en) -> country code, built once countries load
const COUNTRY_LOOKUP = new Map();
let lookupBuilt = false;

function displayName(country) {
  if (!country) return '';
  return getLang() === 'en' ? (country.name_en || country.name) : country.name;
}

function encodeResultV3(data) {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeResultV3(encoded) {
  const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

const $ = id => document.getElementById(id);
const screens = { start:$('start-screen'), game:$('game-screen'), result:$('result-screen') };
const flagStage = $('flag-stage');
const flagImg = $('flag-img');
const flagEmoji = $('flag-emoji');
const input = $('country-input');
const feedback = $('feedback-toast');

function showScreen(name) {
  Object.values(screens).forEach(el => el.classList.remove('active'));
  screens[name].classList.add('active');
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/ё/g,'е').replace(/[—–-]/g,' ').replace(/[^a-zа-я0-9\s']/gi,' ').replace(/\s+/g,' ').trim();
}

function registerPhrase(phrase, code) {
  const normalized = normalize(phrase);
  if (normalized) COUNTRY_LOOKUP.set(normalized, code);
}

function buildCountryLookup() {
  if (lookupBuilt) return;
  lookupBuilt = true;
  for (const c of countries) {
    registerPhrase(c.name, c.code);
    if (c.name_en) registerPhrase(c.name_en, c.code);
  }
  for (const [code, aliases] of Object.entries(ALIASES_RU)) {
    aliases.forEach(a => registerPhrase(a, code));
  }
  for (const [code, aliases] of Object.entries(ALIASES_EN)) {
    aliases.forEach(a => registerPhrase(a, code));
  }
}

// Returns the matched country's ISO code (or '' if the typed text — in
// Russian or English — doesn't match any known country/alias).
function matchCountry(value) {
  const normalized = normalize(value);
  if (!normalized) return '';
  return COUNTRY_LOOKUP.get(normalized) || '';
}

function emojiToTwemojiUrl(emoji) {
  const codepoints = [...emoji]
    .map(ch => ch.codePointAt(0).toString(16))
    .filter(cp => cp !== 'fe0f')
    .join('-');
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`;
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function loadCountries() {
  if (countries.length) return;
  const response = await fetch('flags.json?v=2', { cache:'force-cache' });
  if (!response.ok) throw new Error('Не удалось загрузить flags.json');
  countries = await response.json();
  buildCountryLookup();
}

function renderRecord() {
  const record = JSON.parse(localStorage.getItem('v3_record') || 'null');
  $('record-count').textContent = record ? `${record.correct} ${t('record_out_of_prep_v3', 'из')} ${record.total}` : '—';
  $('record-sub').textContent = record ? `${record.pct}${t('record_accuracy_suffix', '% точность · ')}${record.date}` : t('record_empty', 'Сыграй первую партию!');
}

function setFlag(country) {
  flagStage.classList.toggle('optimized', optimizeFlags);
  if (optimizeFlags) {
    flagEmoji.innerHTML = '';
    const img = document.createElement('img');
    img.src = emojiToTwemojiUrl(country.emoji || '🏳️');
    img.alt = '';
    img.decoding = 'async';
    flagEmoji.appendChild(img);
    flagImg.removeAttribute('src');
  } else {
    flagEmoji.innerHTML = '';
    flagImg.src = `https://flagcdn.com/w640/${country.code}.png`;
    flagImg.srcset = `https://flagcdn.com/w1280/${country.code}.png 2x`;
  }
}

function updateGame() {
  $('score-correct').textContent = correct;
  $('score-wrong').textContent = wrong;
  $('progress-number').textContent = `${Math.min(index + 1, deck.length)} / ${deck.length}`;
  $('progress-fill').style.width = `${deck.length ? index / deck.length * 100 : 0}%`;
  if (index < deck.length) setFlag(deck[index]);
}

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = `feedback-toast ${type}`;
}

async function startGame() {
  try {
    await loadCountries();
  } catch (error) {
    showFeedback(t('load_error', 'Не удалось загрузить список флагов. Обнови страницу.'), 'wrong');
    return;
  }
  deck = shuffle(countries);
  index = 0; correct = 0; wrong = 0; skipped = 0; active = true;
  showScreen('game');
  showFeedback('', '');
  updateGame();
  input.value = '';
  input.focus();
}

function submitAnswer(event) {
  event.preventDefault();
  if (!active || !deck[index]) return;
  const answerCode = matchCountry(input.value);
  if (!answerCode) return;
  const expectedCode = deck[index].code;
  if (answerCode === expectedCode) {
    correct += 1;
    showFeedback(`${t('feedback_right_prefix', 'Верно —')} ${displayName(deck[index])}!`, 'correct');
    index += 1;
    input.value = '';
    if (index >= deck.length) {
      endGame(true);
      return;
    }
    updateGame();
  } else {
    wrong += 1;
    $('score-wrong').textContent = wrong;
    showFeedback(t('feedback_wrong_try_again', 'Не угадано. Попробуй ещё раз.'), 'wrong');
    input.select();
  }
}

function skipFlag() {
  if (!active || !deck[index]) return;
  const skippedCountry = displayName(deck[index]);
  skipped += 1;
  index += 1;
  input.value = '';
  showFeedback(`${t('feedback_skipped_prefix', 'Пропущено —')} ${skippedCountry}`, 'skip');
  if (index >= deck.length) {
    endGame(true);
    return;
  }
  updateGame();
  input.focus();
}

function endGame(allDone = false) {
  if (!active && screens.result.classList.contains('active')) return;
  active = false;
  const attempts = correct + wrong;
  const pct = attempts ? Math.round(correct / attempts * 100) : 0;
  const old = JSON.parse(localStorage.getItem('v3_record') || 'null');
  const isRecord = !old || correct > old.correct || (correct === old.correct && pct > old.pct);
  if (isRecord) {
    localStorage.setItem('v3_record', JSON.stringify({ correct, total:countries.length, pct, date:new Date().toLocaleDateString('ru-RU') }));
  }

  $('res-correct').textContent = correct;
  $('res-wrong').textContent = wrong;
  $('res-pct').textContent = `${pct}%`;
  $('result-title').textContent = allDone ? t('result_alldone', 'Все флаги угаданы!') : t('result_finished', 'Игра завершена');
  $('result-subtitle').textContent = allDone
    ? `${t('result_alldone_sub', 'Ты прошёл весь набор флагов мира. Пропущено:')} ${skipped}.`
    : `${t('result_partial_sub1', 'Пройдено')} ${index} ${t('result_partial_sub2', 'из')} ${deck.length} ${t('result_partial_sub3', 'флагов · пропущено')} ${skipped}.`;
  $('result-trophy').textContent = allDone ? '🌍' : correct >= 100 ? '🏆' : correct >= 30 ? '🥇' : '🎯';
  $('new-record-banner').classList.toggle('show', isRecord);

  const shareData = {
    correct, wrong, total: deck.length, pct, allDone,
    date: new Date().toLocaleDateString('ru-RU'),
  };
  const url = new URL(location.href);
  url.search = '';
  url.hash = encodeResultV3(shareData);
  $('share-url').value = url.toString();
  showScreen('result');
  renderRecord();
}

$('optimize-flags-v3').checked = optimizeFlags;
$('optimize-flags-v3').addEventListener('change', event => {
  optimizeFlags = event.target.checked;
  localStorage.setItem('v3_optimize_flags', optimizeFlags ? '1' : '0');
});
$('btn-start').addEventListener('click', startGame);
$('btn-again').addEventListener('click', startGame);
$('answer-form').addEventListener('submit', submitAnswer);
$('btn-skip').addEventListener('click', skipFlag);
$('btn-finish').addEventListener('click', () => endGame(false));
$('copy-btn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('share-url').value);
    $('copy-btn').textContent = '✓';
    setTimeout(() => $('copy-btn').textContent = '⧉', 1200);
  } catch { $('share-url').select(); document.execCommand('copy'); }
});

renderRecord();

document.addEventListener('langchange', renderRecord);

function renderSharedResult(data) {
  const { correct, wrong, total, pct, allDone, date } = data;
  $('res-correct').textContent = correct;
  $('res-wrong').textContent = wrong;
  $('res-pct').textContent = `${pct}%`;
  $('result-title').textContent = t('friend_result', 'Результат друга');
  $('result-subtitle').textContent = allDone
    ? `${t('friend_alldone', 'Друг прошёл весь набор флагов мира.')}${date ? ' ' + date + '.' : ''}`
    : `${t('friend_partial_prefix', 'Друг угадал')} ${correct} ${t('record_out_of_prep_v3', 'из')} ${total} ${t('friend_partial_suffix', 'флагов')} (${pct}%).${date ? ' ' + date + '.' : ''}`;
  $('result-trophy').textContent = allDone ? '🌍' : correct >= 100 ? '🏆' : correct >= 30 ? '🥇' : '🎯';
  $('new-record-banner')?.classList.remove('show');
  $('share-url').value = location.href;
  showScreen('result');
}

(function initFromShareV3() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  try {
    const data = decodeResultV3(hash);
    if (data && typeof data.correct === 'number') renderSharedResult(data);
  } catch (e) {

  }
})();
