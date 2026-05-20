'use strict';

// ── Full country list (195 recognized states) ─────────────────────
// Includes common aliases so players don't get stuck on spelling

const COUNTRIES = new Set([
  // Европа
  "Россия","Германия","Франция","Италия","Испания","Великобритания",
  "Польша","Нидерланды","Швеция","Норвегия","Финляндия","Швейцария",
  "Австрия","Бельгия","Португалия","Греция","Румыния","Венгрия",
  "Чехия","Дания","Украина","Беларусь","Словакия","Болгария",
  "Сербия","Хорватия","Босния и Герцеговина","Словения","Литва",
  "Латвия","Эстония","Молдова","Албания","Северная Македония",
  "Черногория","Ирландия","Исландия","Люксембург","Мальта","Кипр",
  "Лихтенштейн","Монако","Андорра","Сан-Марино","Ватикан",
  // Азия
  "Китай","Япония","Индия","Южная Корея","Индонезия","Таиланд",
  "Вьетнам","Филиппины","Малайзия","Сингапур","Казахстан",
  "Саудовская Аравия","ОАЭ","Иран","Ирак","Пакистан","Бангладеш",
  "Израиль","Иордания","Сирия","Турция","Афганистан","Мьянма",
  "Камбоджа","Лаос","Монголия","Северная Корея","Непал","Шри-Ланка",
  "Мальдивы","Бутан","Узбекистан","Туркменистан","Таджикистан",
  "Кыргызстан","Азербайджан","Армения","Грузия","Ливан","Кувейт",
  "Катар","Бахрейн","Оман","Йемен","Бруней","Восточный Тимор",
  "Палестина",
  // Африка
  "Египет","ЮАР","Нигерия","Кения","Марокко","Эфиопия","Танзания",
  "Гана","Алжир","Тунис","Ливия","Судан","Южный Судан","Конго",
  "ДР Конго","Ангола","Мозамбик","Замбия","Зимбабве","Уганда",
  "Руанда","Бурунди","Камерун","Кот-д'Ивуар","Сенегал","Мали",
  "Буркина-Фасо","Нигер","Чад","Мавритания","Гвинея","Бенин",
  "Того","Сьерра-Леоне","Либерия","Гамбия","Гвинея-Бисау",
  "Кабо-Верде","Сомали","Джибути","Эритрея","Экваториальная Гвинея",
  "Габон","ЦАР","Намибия","Ботсвана","Лесото","Эсватини","Малави",
  "Мадагаскар","Маврикий","Сейшелы","Коморы","Сан-Томе и Принсипи",
  // Северная и Центральная Америка
  "США","Канада","Мексика","Куба","Гаити","Доминиканская Республика",
  "Ямайка","Тринидад и Тобаго","Панама","Коста-Рика","Никарагуа",
  "Гондурас","Сальвадор","Гватемала","Белиз","Багамы","Барбадос",
  "Сент-Люсия","Гренада","Антигуа и Барбуда","Доминика",
  "Сент-Китс и Невис","Сент-Винсент и Гренадины",
  // Южная Америка
  "Бразилия","Аргентина","Колумбия","Перу","Чили","Венесуэла",
  "Боливия","Парагвай","Уругвай","Эквадор","Гайана","Суринам",
  // Океания
  "Австралия","Новая Зеландия","Папуа — Новая Гвинея","Фиджи",
  "Соломоновы Острова","Вануату","Самоа","Кирибати","Тонга",
  "Микронезия","Палау","Маршалловы Острова","Науру","Тувалу",
]);

// ── Alias map: alternate spellings → canonical ────────────────────
const ALIASES = {
  // Россия
  "рф": "Россия", "российская федерация": "Россия",
  // США
  "сша": "США", "америка": "США", "соединённые штаты": "США",
  "соединенные штаты": "США", "штаты": "США",
  // Великобритания
  "великобритания": "Великобритания", "британия": "Великобритания",
  "англия": "Великобритания", "великая британия": "Великобритания",
  "uk": "Великобритания",
  // ОАЭ
  "оаэ": "ОАЭ", "объединённые арабские эмираты": "ОАЭ",
  "объединенные арабские эмираты": "ОАЭ", "эмираты": "ОАЭ",
  // ДР Конго
  "дрк": "ДР Конго", "демократическая республика конго": "ДР Конго",
  "конго-киншаса": "ДР Конго", "заир": "ДР Конго",
  // ЮАР
  "юар": "ЮАР", "южная африка": "ЮАР",
  // ЦАР
  "цар": "ЦАР", "центральноафриканская республика": "ЦАР",
  // Чехия
  "чехия": "Чехия", "чешская республика": "Чехия", "чехословакия": "Чехия",
  // Северная Корея
  "северная корея": "Северная Корея", "кндр": "Северная Корея",
  // Южная Корея
  "южная корея": "Южная Корея", "корея": "Южная Корея",
  // Тайвань (спорная — не включаем в набор, но признаём как ввод)
  // Мьянма
  "мьянма": "Мьянма", "бирма": "Мьянма",
  // Эсватини
  "эсватини": "Эсватини", "свазиленд": "Эсватини",
  // Северная Македония
  "северная македония": "Северная Македония", "македония": "Северная Македония",
  // Восточный Тимор
  "восточный тимор": "Восточный Тимор", "тимор-лесте": "Восточный Тимор",
  // Папуа
  "папуа новая гвинея": "Папуа — Новая Гвинея",
  "папуа-новая гвинея": "Папуа — Новая Гвинея",
  // Кот-д'Ивуар
  "кот д'ивуар": "Кот-д'Ивуар", "кот дивуар": "Кот-д'Ивуар",
  "берег слоновой кости": "Кот-д'Ивуар",
  // Босния
  "босния": "Босния и Герцеговина", "герцеговина": "Босния и Герцеговина",
  // Тринидад
  "тринидад": "Тринидад и Тобаго",
  // Антигуа
  "антигуа": "Антигуа и Барбуда",
  // Сент-Китс
  "сент китс": "Сент-Китс и Невис", "сент-китс": "Сент-Китс и Невис",
  // Сент-Винсент
  "сент винсент": "Сент-Винсент и Гренадины",
  "сент-винсент": "Сент-Винсент и Гренадины",
  // Сан-Томе
  "сан томе": "Сан-Томе и Принсипи",
  "сан-томе": "Сан-Томе и Принсипи",
  // Соломоновы острова
  "соломоновы острова": "Соломоновы Острова",
  "маршалловы острова": "Маршалловы Острова",
  // Микронезия
  "федеративные штаты микронезии": "Микронезия",
  // Палестина
  "палестинская автономия": "Палестина",
  // Нидерланды
  "голландия": "Нидерланды", "нидерланды": "Нидерланды",
  // Беларусь
  "белоруссия": "Беларусь",
  // Молдова
  "молдавия": "Молдова",
  // Кыргызстан
  "киргизия": "Кыргызстан", "киргизстан": "Кыргызстан",
  // Каждая страна сама на себя (lowercase)
};

// Pre-build lowercase lookup for all canonical countries
const CANONICAL_LOWER = new Map();
for (const c of COUNTRIES) {
  CANONICAL_LOWER.set(c.toLowerCase(), c);
}

/**
 * Try to match user input to a canonical country name.
 * Returns canonical name or null.
 */
function matchCountry(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();

  // Direct canonical match
  if (CANONICAL_LOWER.has(lower)) return CANONICAL_LOWER.get(lower);

  // Alias match
  if (ALIASES[lower]) {
    const alias = ALIASES[lower];
    // Make sure alias is an actual country
    if (COUNTRIES.has(alias)) return alias;
    // Alias might itself need canonical lookup
    const aliasLower = alias.toLowerCase();
    if (CANONICAL_LOWER.has(aliasLower)) return CANONICAL_LOWER.get(aliasLower);
  }

  return null;
}

// ── Constants ─────────────────────────────────────────────────────
const TOTAL_COUNTRIES = 195;
const DURATION_SECS   = 10 * 60; // 10 minutes
const CIRCUMFERENCE   = 2 * Math.PI * 50; // r=50

// ── State ─────────────────────────────────────────────────────────
let answered   = new Set();  // canonical names entered correctly
let timeLeft   = DURATION_SECS;
let timerInterval = null;
let gameActive = false;

// ── DOM refs ──────────────────────────────────────────────────────
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

const btnStart  = document.getElementById('btn-start');
const btnAgain  = document.getElementById('btn-again');

// ── Screen management ─────────────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ── Timer ─────────────────────────────────────────────────────────
function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateRing(secs) {
  const frac = secs / DURATION_SECS;
  const offset = CIRCUMFERENCE * (1 - frac);
  ringFillEl.style.strokeDashoffset = offset;
  // Color shift as time runs out
  ringFillEl.style.stroke =
    frac > .5 ? 'url(#timerGradV2)' :
    frac > .2 ? '#f5c842' : '#f4536a';
}

function startTimer() {
  timeLeft = DURATION_SECS;
  timerTextEl.textContent = formatTime(timeLeft);
  updateRing(timeLeft);
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerTextEl.textContent = formatTime(timeLeft);
    updateRing(timeLeft);
    if (timeLeft <= 0) endGame();
  }, 1000);
}

// ── Stats update ──────────────────────────────────────────────────
function updateStats() {
  const n = answered.size;
  const pct = Math.round(n / TOTAL_COUNTRIES * 100);
  countCorrectEl.textContent = n;
  pctValEl.textContent = pct + '%';
  progressFillEl.style.width = pct + '%';
  answeredHeader.textContent = `Принятые страны (${n})`;
}

// ── Add tag to answered list ──────────────────────────────────────
function addTag(name) {
  const tag = document.createElement('span');
  tag.className = 'answered-tag';
  tag.textContent = name;
  answeredGrid.appendChild(tag);
  // Scroll to bottom so newest is visible
  const section = answeredGrid.closest('.answered-section');
  section.scrollTop = section.scrollHeight;
}

// ── Feedback toast ────────────────────────────────────────────────
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

// ── Handle submission ─────────────────────────────────────────────
function handleSubmit() {
  if (!gameActive) return;
  const raw = inputEl.value;
  const canonical = matchCountry(raw);

  if (!canonical) {
    // Unknown country
    inputEl.classList.add('shake');
    setTimeout(() => inputEl.classList.remove('shake'), 320);
    showFeedback('❌ Неизвестная страна', 'err');
    return;
  }

  if (answered.has(canonical)) {
    // Duplicate
    inputEl.classList.add('shake');
    setTimeout(() => inputEl.classList.remove('shake'), 320);
    showFeedback(`🔁 «${canonical}» уже есть!`, 'dup');
    inputEl.value = '';
    return;
  }

  // Correct!
  answered.add(canonical);
  addTag(canonical);
  updateStats();

  inputEl.classList.add('glow-correct');
  setTimeout(() => inputEl.classList.remove('glow-correct'), 400);
  showFeedback(`✓ ${canonical}`, 'ok');
  inputEl.value = '';

  // All countries found — end early
  if (answered.size >= TOTAL_COUNTRIES) {
    endGame(true);
  }
}

// ── Start game ────────────────────────────────────────────────────
function startGame() {
  answered.clear();
  answeredGrid.innerHTML = '';
  inputEl.value = '';
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback-toast';
  updateStats();
  gameActive = true;
  showScreen('game');
  startTimer();
  setTimeout(() => inputEl.focus(), 100);
}

// ── End game ──────────────────────────────────────────────────────
function endGame(allDone = false) {
  clearInterval(timerInterval);
  gameActive = false;
  showScreen('result');

  const n = answered.size;
  const pct = Math.round(n / TOTAL_COUNTRIES * 100);

  resCorrectEl.textContent = n;
  resPctEl.textContent = pct + '%';

  // Trophy & title
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
  resultSubEl.textContent    = subtitle;

  // Build result tags
  resultTagsEl.innerHTML = '';
  const sorted = [...answered].sort((a, b) => a.localeCompare(b, 'ru'));
  for (const c of sorted) {
    const tag = document.createElement('span');
    tag.className = 'result-tag';
    tag.textContent = c;
    resultTagsEl.appendChild(tag);
  }

  // Share URL
  const now = new Date().toISOString().slice(0, 16).replace('T', '+');
  const hash = `n=${n}&pct=${pct}&d=${encodeURIComponent(now)}`;
  const base = location.href.replace(/\/[^/]*$/, '/');
  shareUrlEl.value = base + 'result-v2.html#' + hash;
}

// ── Events ────────────────────────────────────────────────────────
btnStart?.addEventListener('click', startGame);
btnAgain?.addEventListener('click', startGame);
submitBtn?.addEventListener('click', handleSubmit);

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
