'use strict';

const COUNTRIES = new Set([
  "Россия","Германия","Франция","Италия","Испания","Великобритания",
  "Польша","Нидерланды","Швеция","Норвегия","Финляндия","Швейцария",
  "Австрия","Бельгия","Португалия","Греция","Румыния","Венгрия",
  "Чехия","Дания","Украина","Беларусь","Словакия","Болгария",
  "Сербия","Хорватия","Босния и Герцеговина","Словения","Литва",
  "Латвия","Эстония","Молдова","Албания","Северная Македония",
  "Черногория","Ирландия","Исландия","Люксембург","Мальта","Кипр",
  "Лихтенштейн","Монако","Андорра","Сан-Марино","Ватикан",
  "Китай","Япония","Индия","Южная Корея","Индонезия","Таиланд",
  "Вьетнам","Филиппины","Малайзия","Сингапур","Казахстан",
  "Саудовская Аравия","ОАЭ","Иран","Ирак","Пакистан","Бангладеш",
  "Израиль","Иордания","Сирия","Турция","Афганистан","Мьянма",
  "Камбоджа","Лаос","Монголия","Северная Корея","Непал","Шри-Ланка",
  "Мальдивы","Бутан","Узбекистан","Туркменистан","Таджикистан",
  "Кыргызстан","Азербайджан","Армения","Грузия","Ливан","Кувейт",
  "Катар","Бахрейн","Оман","Йемен","Бруней","Восточный Тимор",
  "Палестина",
  "Египет","ЮАР","Нигерия","Кения","Марокко","Эфиопия","Танзания",
  "Гана","Алжир","Тунис","Ливия","Судан","Южный Судан","Конго",
  "ДР Конго","Ангола","Мозамбик","Замбия","Зимбабве","Уганда",
  "Руанда","Бурунди","Камерун","Кот-д'Ивуар","Сенегал","Мали",
  "Буркина-Фасо","Нигер","Чад","Мавритания","Гвинея","Бенин",
  "Того","Сьерра-Леоне","Либерия","Гамбия","Гвинея-Бисау",
  "Кабо-Верде","Сомали","Джибути","Эритрея","Экваториальная Гвинея",
  "Габон","ЦАР","Намибия","Ботсвана","Лесото","Эсватини","Малави",
  "Мадагаскар","Маврикий","Сейшелы","Коморы","Сан-Томе и Принсипи",
  "США","Канада","Мексика","Куба","Гаити","Доминиканская Республика",
  "Ямайка","Тринидад и Тобаго","Панама","Коста-Рика","Никарагуа",
  "Гондурас","Сальвадор","Гватемала","Белиз","Багамы","Барбадос",
  "Сент-Люсия","Гренада","Антигуа и Барбуда","Доминика",
  "Сент-Китс и Невис","Сент-Винсент и Гренадины",
  "Бразилия","Аргентина","Колумбия","Перу","Чили","Венесуэла",
  "Боливия","Парагвай","Уругвай","Эквадор","Гайана","Суринам",
  "Австралия","Новая Зеландия","Папуа — Новая Гвинея","Фиджи",
  "Соломоновы Острова","Вануату","Самоа","Кирибати","Тонга",
  "Микронезия","Палау","Маршалловы Острова","Науру","Тувалу",
]);

const COUNTRY_CODES = {"Россия":"ru","Германия":"de","Франция":"fr","Италия":"it","Испания":"es","Великобритания":"gb","Польша":"pl","Нидерланды":"nl","Швеция":"se","Норвегия":"no","Финляндия":"fi","Швейцария":"ch","Австрия":"at","Бельгия":"be","Португалия":"pt","Греция":"gr","Румыния":"ro","Венгрия":"hu","Чехия":"cz","Дания":"dk","Украина":"ua","Беларусь":"by","Словакия":"sk","Болгария":"bg","Сербия":"rs","Хорватия":"hr","Босния и Герцеговина":"ba","Словения":"si","Литва":"lt","Латвия":"lv","Эстония":"ee","Молдова":"md","Албания":"al","Северная Македония":"mk","Черногория":"me","Ирландия":"ie","Исландия":"is","Люксембург":"lu","Мальта":"mt","Кипр":"cy","Лихтенштейн":"li","Монако":"mc","Андорра":"ad","Сан-Марино":"sm","Ватикан":"va","Китай":"cn","Япония":"jp","Индия":"in","Южная Корея":"kr","Индонезия":"id","Таиланд":"th","Вьетнам":"vn","Филиппины":"ph","Малайзия":"my","Сингапур":"sg","Казахстан":"kz","Саудовская Аравия":"sa","ОАЭ":"ae","Иран":"ir","Ирак":"iq","Пакистан":"pk","Бангладеш":"bd","Израиль":"il","Иордания":"jo","Сирия":"sy","Турция":"tr","Афганистан":"af","Мьянма":"mm","Камбоджа":"kh","Лаос":"la","Монголия":"mn","Северная Корея":"kp","Непал":"np","Шри-Ланка":"lk","Мальдивы":"mv","Бутан":"bt","Узбекистан":"uz","Туркменистан":"tm","Таджикистан":"tj","Кыргызстан":"kg","Азербайджан":"az","Армения":"am","Грузия":"ge","Ливан":"lb","Кувейт":"kw","Катар":"qa","Бахрейн":"bh","Оман":"om","Йемен":"ye","Бруней":"bn","Восточный Тимор":"tl","Палестина":"ps","Египет":"eg","ЮАР":"za","Нигерия":"ng","Кения":"ke","Марокко":"ma","Эфиопия":"et","Танзания":"tz","Гана":"gh","Алжир":"dz","Тунис":"tn","Ливия":"ly","Судан":"sd","Южный Судан":"ss","Конго":"cg","ДР Конго":"cd","Ангола":"ao","Мозамбик":"mz","Замбия":"zm","Зимбабве":"zw","Уганда":"ug","Руанда":"rw","Бурунди":"bi","Камерун":"cm","Кот-д'Ивуар":"ci","Сенегал":"sn","Мали":"ml","Буркина-Фасо":"bf","Нигер":"ne","Чад":"td","Мавритания":"mr","Гвинея":"gn","Бенин":"bj","Того":"tg","Сьерра-Леоне":"sl","Либерия":"lr","Гамбия":"gm","Гвинея-Бисау":"gw","Кабо-Верде":"cv","Сомали":"so","Джибути":"dj","Эритрея":"er","Экваториальная Гвинея":"gq","Габон":"ga","ЦАР":"cf","Намибия":"na","Ботсвана":"bw","Лесото":"ls","Эсватини":"sz","Малави":"mw","Мадагаскар":"mg","Маврикий":"mu","Сейшелы":"sc","Коморы":"km","Сан-Томе и Принсипи":"st","США":"us","Канада":"ca","Мексика":"mx","Куба":"cu","Гаити":"ht","Доминиканская Республика":"do","Ямайка":"jm","Тринидад и Тобаго":"tt","Панама":"pa","Коста-Рика":"cr","Никарагуа":"ni","Гондурас":"hn","Сальвадор":"sv","Гватемала":"gt","Белиз":"bz","Багамы":"bs","Барбадос":"bb","Сент-Люсия":"lc","Гренада":"gd","Антигуа и Барбуда":"ag","Доминика":"dm","Сент-Китс и Невис":"kn","Сент-Винсент и Гренадины":"vc","Бразилия":"br","Аргентина":"ar","Колумбия":"co","Перу":"pe","Чили":"cl","Венесуэла":"ve","Боливия":"bo","Парагвай":"py","Уругвай":"uy","Эквадор":"ec","Гайана":"gy","Суринам":"sr","Австралия":"au","Новая Зеландия":"nz","Папуа — Новая Гвинея":"pg","Фиджи":"fj","Соломоновы Острова":"sb","Вануату":"vu","Самоа":"ws","Кирибати":"ki","Тонга":"to","Микронезия":"fm","Палау":"pw","Маршалловы Острова":"mh","Науру":"nr","Тувалу":"tv"};
let flagsMap = null;
let optimizeFlags = localStorage.getItem('v2_optimize_flags') === '1';

async function getFlagsMap() {
  if (flagsMap) return flagsMap;
  const res = await fetch('flags.json', { cache: 'force-cache' });
  if (!res.ok) throw new Error('Не удалось загрузить flags.json');
  const flags = await res.json();
  flagsMap = new Map(flags.map(f => [f.name, f]));
  return flagsMap;
}

function createCountryFlagNode(name) {
  if (optimizeFlags) {
    const span = document.createElement('span');
    span.className = 'country-flag-emoji';
    span.textContent = flagsMap?.get(name)?.emoji || '🏳️';
    span.setAttribute('aria-hidden', 'true');
    return span;
  }

  const code = COUNTRY_CODES[name];
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

function fillCountryTag(tag, name) {
  const flag = createCountryFlagNode(name);
  if (flag) tag.appendChild(flag);
  const text = document.createElement('span');
  text.textContent = name;
  tag.appendChild(text);
}

const ALIASES = {
  "рф": "Россия", "российская федерация": "Россия",
  "сша": "США", "америка": "США", "соединённые штаты": "США",
  "соединенные штаты": "США", "штаты": "США",
  "великобритания": "Великобритания", "британия": "Великобритания",
  "англия": "Великобритания", "великая британия": "Великобритания",
  "uk": "Великобритания",
  "оаэ": "ОАЭ", "объединённые арабские эмираты": "ОАЭ",
  "объединенные арабские эмираты": "ОАЭ", "эмираты": "ОАЭ",
  "дрк": "ДР Конго", "демократическая республика конго": "ДР Конго",
  "конго-киншаса": "ДР Конго", "заир": "ДР Конго",
  "юар": "ЮАР", "южная африка": "ЮАР",
  "цар": "ЦАР", "центральноафриканская республика": "ЦАР",
  "чехия": "Чехия", "чешская республика": "Чехия", "чехословакия": "Чехия",
  "северная корея": "Северная Корея", "кндр": "Северная Корея",
  "южная корея": "Южная Корея", "корея": "Южная Корея",
  "мьянма": "Мьянма", "бирма": "Мьянма",
  "эсватини": "Эсватини", "свазиленд": "Эсватини",
  "северная македония": "Северная Македония", "македония": "Северная Македония",
  "восточный тимор": "Восточный Тимор", "тимор-лесте": "Восточный Тимор",
  "папуа новая гвинея": "Папуа — Новая Гвинея",
  "папуа-новая гвинея": "Папуа — Новая Гвинея",
  "кот д'ивуар": "Кот-д'Ивуар", "кот дивуар": "Кот-д'Ивуар",
  "берег слоновой кости": "Кот-д'Ивуар",
  "босния": "Босния и Герцеговина", "герцеговина": "Босния и Герцеговина",
  "тринидад": "Тринидад и Тобаго",
  "антигуа": "Антигуа и Барбуда",
  "сент китс": "Сент-Китс и Невис", "сент-китс": "Сент-Китс и Невис",
  "сент винсент": "Сент-Винсент и Гренадины",
  "сент-винсент": "Сент-Винсент и Гренадины",
  "сан томе": "Сан-Томе и Принсипи",
  "сан-томе": "Сан-Томе и Принсипи",
  "соломоновы острова": "Соломоновы Острова",
  "маршалловы острова": "Маршалловы Острова",
  "федеративные штаты микронезии": "Микронезия",
  "палестинская автономия": "Палестина",
  "голландия": "Нидерланды", "нидерланды": "Нидерланды",
  "белоруссия": "Беларусь",
  "молдавия": "Молдова",
  "киргизия": "Кыргызстан", "киргизстан": "Кыргызстан",
};

const CANONICAL_LOWER = new Map();
const COUNTRY_LOOKUP = new Map();
let MAX_COUNTRY_WORDS = 1;

function normalizeText(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[—–-]/g, ' ')
    .replace(/[^a-zа-я0-9\s']/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function registerCountryPhrase(phrase, canonical) {
  const normalized = normalizeText(phrase);
  if (!normalized || !COUNTRIES.has(canonical)) return;
  COUNTRY_LOOKUP.set(normalized, canonical);
  MAX_COUNTRY_WORDS = Math.max(MAX_COUNTRY_WORDS, normalized.split(' ').length);
}

for (const c of COUNTRIES) {
  CANONICAL_LOWER.set(c.toLowerCase(), c);
  registerCountryPhrase(c, c);
}

for (const [alias, canonical] of Object.entries(ALIASES)) {
  if (COUNTRIES.has(canonical)) registerCountryPhrase(alias, canonical);
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
  answeredHeader.textContent = `Принятые страны (${n})`;
}

function addTag(name) {
  const tag = document.createElement('span');
  tag.className = 'answered-tag';
  fillCountryTag(tag, name);
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

function renderOneRecord(mode) {
  const saved = JSON.parse(localStorage.getItem(RECORD_KEYS[mode]) || 'null');
  const countEl = document.getElementById(`record-count-${mode}`);
  const subEl = document.getElementById(`record-sub-${mode}`);

  if (!countEl || !subEl) return;

  if (saved) {
    countEl.textContent = saved.count + ' стран';
    subEl.textContent = saved.pct + '% от всех · ' + saved.date;
  } else {
    countEl.textContent = '—';
    subEl.textContent = 'Сыграй первую партию!';
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
    banner.textContent = currentMode === 'voice' ? '🎉 Новый рекорд голосовой игры!' : '🎉 Новый рекорд текстовой игры!';
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

  const canonical = COUNTRIES.has(raw) ? raw : matchCountry(raw);

  if (!canonical) {
    if (source === 'typed') {
      flashInput('shake');
      showFeedback('❌ Неизвестная страна', 'err');
    }
    return { status: 'unknown', raw };
  }

  if (answered.has(canonical)) {
    if (source === 'typed') {
      flashInput('shake');
      showFeedback(`🔁 «${canonical}» уже есть!`, 'dup');
      inputEl.value = '';
    }
    return { status: 'duplicate', canonical };
  }

  answered.add(canonical);
  addTag(canonical);
  updateStats();

  flashInput('glow-correct', 400);
  if (source === 'typed') {
    showFeedback(`✓ ${canonical}`, 'ok');
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
    if (added) parts.push(`✓ добавлено: ${added}`);
    if (duplicated) parts.push(`🔁 уже были: ${duplicated}`);
    if (unknown.length) parts.push(`не распознано: ${unknown.length}`);
    showFeedback(parts.join(' · '), added ? 'ok' : 'dup');
    setVoiceStatus(`🎙️ Слушаю... ${parts.join(' · ')}`, 'listening');
  } else if (unknown.length) {
    setVoiceStatus('🎙️ Слушаю... стран не найдено', 'err');
  }
}

function applyGameMode(mode) {
  currentMode = mode === 'voice' ? 'voice' : 'text';
  screens.game.classList.toggle('mode-voice', currentMode === 'voice');
  screens.game.classList.toggle('mode-text', currentMode === 'text');

  if (gameModeBadge) {
    gameModeBadge.textContent = currentMode === 'voice' ? '🎙️ Голосовая игра' : '⌨️ Текстовая игра';
  }

  if (inputEl) {
    inputEl.disabled = currentMode !== 'text';
    inputEl.value = '';
  }
  if (submitBtn) submitBtn.disabled = currentMode !== 'text';

  setVoiceStatus(
    currentMode === 'voice'
      ? 'Запрашиваю доступ к микрофону...'
      : 'Голосовой ввод доступен только в отдельной голосовой игре'
  );
}

async function startGame(mode = currentMode || 'text') {
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
  if (optimizeFlags) {
    try { await getFlagsMap(); } catch (err) { console.warn(err); }
  }
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
    trophy = '🌍'; title = 'Все страны!'; subtitle = 'Невероятный результат! Ты знаешь все 195 стран мира!';
  } else if (pct >= 70) {
    trophy = '🏆'; title = 'Легенда географии!'; subtitle = `${n} стран — это потрясающе! Ты настоящий эксперт.`;
  } else if (pct >= 50) {
    trophy = '🥇'; title = 'Отличный результат!'; subtitle = `${n} стран из 195 — больше половины! Достойно.`;
  } else if (pct >= 30) {
    trophy = '🥈'; title = 'Хороший результат!'; subtitle = `${n} стран — неплохо, но есть куда расти!`;
  } else if (pct >= 15) {
    trophy = '🌐'; title = 'Неплохое начало!'; subtitle = `${n} стран — попробуй ещё раз, ты можешь лучше!`;
  } else {
    trophy = '🗺️'; title = 'Время вышло!'; subtitle = `${n} стран — в следующий раз узнаешь больше!`;
  }

  resultTrophyEl.textContent = trophy;
  resultTitleEl.textContent  = title;
  resultSubEl.textContent    = (currentMode === 'voice' ? 'Голосовая игра · ' : 'Текстовая игра · ') + subtitle;

  resultTagsEl.innerHTML = '';
  const sorted = [...answered].sort((a, b) => a.localeCompare(b, 'ru'));
  for (const c of sorted) {
    const tag = document.createElement('span');
    tag.className = 'result-tag';
    fillCountryTag(tag, c);
    resultTagsEl.appendChild(tag);
  }

  const now = new Date().toISOString().slice(0, 16).replace('T', '+');
  const hash = `mode=${currentMode}&n=${n}&pct=${pct}&d=${encodeURIComponent(now)}`;
  const base = location.href.replace(/\/[^/]*$/, '/');
  shareUrlEl.value = base + 'v2.html#' + hash;
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
