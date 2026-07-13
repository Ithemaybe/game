'use strict';

const ALIASES = {
  'рф':'Россия','российская федерация':'Россия','сша':'США','америка':'США','соединенные штаты':'США','соединённые штаты':'США',
  'британия':'Великобритания','англия':'Великобритания','великая британия':'Великобритания','uk':'Великобритания',
  'оаэ':'ОАЭ','объединенные арабские эмираты':'ОАЭ','объединённые арабские эмираты':'ОАЭ','эмираты':'ОАЭ',
  'дрк':'ДР Конго','демократическая республика конго':'ДР Конго','конго киншаса':'ДР Конго','заир':'ДР Конго',
  'юар':'ЮАР','южная африка':'ЮАР','цар':'ЦАР','центральноафриканская республика':'ЦАР',
  'чешская республика':'Чехия','кндр':'Северная Корея','корея':'Южная Корея','бирма':'Мьянма','свазиленд':'Эсватини',
  'македония':'Северная Македония','тимор лесте':'Восточный Тимор','папуа новая гвинея':'Папуа — Новая Гвинея',
  'кот дивуар':"Кот-д'Ивуар",'берег слоновой кости':"Кот-д'Ивуар",'босния':'Босния и Герцеговина',
  'голландия':'Нидерланды','белоруссия':'Беларусь','молдавия':'Молдова','киргизия':'Кыргызстан','киргизстан':'Кыргызстан'
};

let countries = [];
let deck = [];
let index = 0;
let correct = 0;
let wrong = 0;
let skipped = 0;
let active = false;
let optimizeFlags = localStorage.getItem('v3_optimize_flags') === '1';

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

function canonicalAnswer(value) {
  const normalized = normalize(value);
  if (!normalized) return '';
  const alias = ALIASES[normalized];
  return alias ? normalize(alias) : normalized;
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
  const response = await fetch('flags.json', { cache:'force-cache' });
  if (!response.ok) throw new Error('Не удалось загрузить flags.json');
  countries = await response.json();
}

function renderRecord() {
  const record = JSON.parse(localStorage.getItem('v3_record') || 'null');
  $('record-count').textContent = record ? `${record.correct} из ${record.total}` : '—';
  $('record-sub').textContent = record ? `${record.pct}% точность · ${record.date}` : 'Сыграй первую партию!';
}

function setFlag(country) {
  flagStage.classList.toggle('optimized', optimizeFlags);
  if (optimizeFlags) {
    flagEmoji.textContent = country.emoji || '🏳️';
    flagImg.removeAttribute('src');
  } else {
    flagEmoji.textContent = '';
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
    showFeedback('Не удалось загрузить список флагов. Обнови страницу.', 'wrong');
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
  const answer = canonicalAnswer(input.value);
  if (!answer) return;
  const expected = normalize(deck[index].name);
  if (answer === expected) {
    correct += 1;
    showFeedback(`Верно — ${deck[index].name}!`, 'correct');
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
    showFeedback('Не угадано. Попробуй ещё раз.', 'wrong');
    input.select();
  }
}

function skipFlag() {
  if (!active || !deck[index]) return;
  const skippedCountry = deck[index].name;
  skipped += 1;
  index += 1;
  input.value = '';
  showFeedback(`Пропущено — ${skippedCountry}`, 'skip');
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
  $('result-title').textContent = allDone ? 'Все флаги угаданы!' : 'Игра завершена';
  $('result-subtitle').textContent = allDone ? `Ты прошёл весь набор флагов мира. Пропущено: ${skipped}.` : `Пройдено ${index} из ${deck.length} флагов · пропущено ${skipped}.`;
  $('result-trophy').textContent = allDone ? '🌍' : correct >= 100 ? '🏆' : correct >= 30 ? '🥇' : '🎯';
  $('new-record-banner').classList.toggle('show', isRecord);

  const url = new URL(location.href);
  url.search = '';
  url.hash = `v3=${correct}-${wrong}`;
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
