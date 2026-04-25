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

// ── Countries dataset (ISO 3166-1 alpha-2 codes for flagcdn.com) ───
const COUNTRIES = [
  // Европа
  {name:"Россия",code:"ru"},{name:"Германия",code:"de"},
  {name:"Франция",code:"fr"},{name:"Италия",code:"it"},
  {name:"Испания",code:"es"},{name:"Великобритания",code:"gb"},
  {name:"Польша",code:"pl"},{name:"Нидерланды",code:"nl"},
  {name:"Швеция",code:"se"},{name:"Норвегия",code:"no"},
  {name:"Финляндия",code:"fi"},{name:"Швейцария",code:"ch"},
  {name:"Австрия",code:"at"},{name:"Бельгия",code:"be"},
  {name:"Португалия",code:"pt"},{name:"Греция",code:"gr"},
  {name:"Румыния",code:"ro"},{name:"Венгрия",code:"hu"},
  {name:"Чехия",code:"cz"},{name:"Дания",code:"dk"},
  {name:"Украина",code:"ua"},{name:"Беларусь",code:"by"},
  {name:"Словакия",code:"sk"},{name:"Болгария",code:"bg"},
  {name:"Сербия",code:"rs"},{name:"Хорватия",code:"hr"},
  {name:"Босния и Герцеговина",code:"ba"},{name:"Словения",code:"si"},
  {name:"Литва",code:"lt"},{name:"Латвия",code:"lv"},
  {name:"Эстония",code:"ee"},{name:"Молдова",code:"md"},
  {name:"Албания",code:"al"},{name:"Северная Македония",code:"mk"},
  {name:"Черногория",code:"me"},{name:"Ирландия",code:"ie"},
  {name:"Исландия",code:"is"},{name:"Люксембург",code:"lu"},
  {name:"Мальта",code:"mt"},{name:"Кипр",code:"cy"},
  {name:"Лихтенштейн",code:"li"},{name:"Монако",code:"mc"},
  {name:"Андорра",code:"ad"},{name:"Сан-Марино",code:"sm"},
  {name:"Ватикан",code:"va"},
  // Азия
  {name:"Китай",code:"cn"},{name:"Япония",code:"jp"},
  {name:"Индия",code:"in"},{name:"Южная Корея",code:"kr"},
  {name:"Индонезия",code:"id"},{name:"Таиланд",code:"th"},
  {name:"Вьетнам",code:"vn"},{name:"Филиппины",code:"ph"},
  {name:"Малайзия",code:"my"},{name:"Сингапур",code:"sg"},
  {name:"Казахстан",code:"kz"},{name:"Саудовская Аравия",code:"sa"},
  {name:"ОАЭ",code:"ae"},{name:"Иран",code:"ir"},
  {name:"Ирак",code:"iq"},{name:"Пакистан",code:"pk"},
  {name:"Бангладеш",code:"bd"},{name:"Израиль",code:"il"},
  {name:"Иордания",code:"jo"},{name:"Сирия",code:"sy"},
  {name:"Турция",code:"tr"},{name:"Афганистан",code:"af"},
  {name:"Мьянма",code:"mm"},{name:"Камбоджа",code:"kh"},
  {name:"Лаос",code:"la"},{name:"Монголия",code:"mn"},
  {name:"Северная Корея",code:"kp"},{name:"Непал",code:"np"},
  {name:"Шри-Ланка",code:"lk"},{name:"Мальдивы",code:"mv"},
  {name:"Бутан",code:"bt"},{name:"Узбекистан",code:"uz"},
  {name:"Туркменистан",code:"tm"},{name:"Таджикистан",code:"tj"},
  {name:"Кыргызстан",code:"kg"},{name:"Азербайджан",code:"az"},
  {name:"Армения",code:"am"},{name:"Грузия",code:"ge"},
  {name:"Ливан",code:"lb"},{name:"Кувейт",code:"kw"},
  {name:"Катар",code:"qa"},{name:"Бахрейн",code:"bh"},
  {name:"Оман",code:"om"},{name:"Йемен",code:"ye"},
  {name:"Бруней",code:"bn"},{name:"Восточный Тимор",code:"tl"},
  {name:"Палестина",code:"ps"},
  // Африка
  {name:"Египет",code:"eg"},{name:"ЮАР",code:"za"},
  {name:"Нигерия",code:"ng"},{name:"Кения",code:"ke"},
  {name:"Марокко",code:"ma"},{name:"Эфиопия",code:"et"},
  {name:"Танзания",code:"tz"},{name:"Гана",code:"gh"},
  {name:"Алжир",code:"dz"},{name:"Тунис",code:"tn"},
  {name:"Ливия",code:"ly"},{name:"Судан",code:"sd"},
  {name:"Южный Судан",code:"ss"},{name:"Конго",code:"cg"},
  {name:"ДР Конго",code:"cd"},{name:"Ангола",code:"ao"},
  {name:"Мозамбик",code:"mz"},{name:"Замбия",code:"zm"},
  {name:"Зимбабве",code:"zw"},{name:"Уганда",code:"ug"},
  {name:"Руанда",code:"rw"},{name:"Бурунди",code:"bi"},
  {name:"Камерун",code:"cm"},{name:"Кот-д'Ивуар",code:"ci"},
  {name:"Сенегал",code:"sn"},{name:"Мали",code:"ml"},
  {name:"Буркина-Фасо",code:"bf"},{name:"Нигер",code:"ne"},
  {name:"Чад",code:"td"},{name:"Мавритания",code:"mr"},
  {name:"Гвинея",code:"gn"},{name:"Бенин",code:"bj"},
  {name:"Того",code:"tg"},{name:"Сьерра-Леоне",code:"sl"},
  {name:"Либерия",code:"lr"},{name:"Гамбия",code:"gm"},
  {name:"Гвинея-Бисау",code:"gw"},{name:"Кабо-Верде",code:"cv"},
  {name:"Сомали",code:"so"},{name:"Джибути",code:"dj"},
  {name:"Эритрея",code:"er"},{name:"Экваториальная Гвинея",code:"gq"},
  {name:"Габон",code:"ga"},{name:"ЦАР",code:"cf"},
  {name:"Намибия",code:"na"},{name:"Ботсвана",code:"bw"},
  {name:"Лесото",code:"ls"},{name:"Эсватини",code:"sz"},
  {name:"Малави",code:"mw"},{name:"Мадагаскар",code:"mg"},
  {name:"Маврикий",code:"mu"},{name:"Сейшелы",code:"sc"},
  {name:"Коморы",code:"km"},{name:"Сан-Томе и Принсипи",code:"st"},
  // Северная и Центральная Америка
  {name:"США",code:"us"},{name:"Канада",code:"ca"},
  {name:"Мексика",code:"mx"},{name:"Куба",code:"cu"},
  {name:"Гаити",code:"ht"},{name:"Доминиканская Республика",code:"do"},
  {name:"Ямайка",code:"jm"},{name:"Тринидад и Тобаго",code:"tt"},
  {name:"Панама",code:"pa"},{name:"Коста-Рика",code:"cr"},
  {name:"Никарагуа",code:"ni"},{name:"Гондурас",code:"hn"},
  {name:"Сальвадор",code:"sv"},{name:"Гватемала",code:"gt"},
  {name:"Белиз",code:"bz"},{name:"Багамы",code:"bs"},
  {name:"Барбадос",code:"bb"},{name:"Сент-Люсия",code:"lc"},
  {name:"Гренада",code:"gd"},{name:"Антигуа и Барбуда",code:"ag"},
  {name:"Доминика",code:"dm"},{name:"Сент-Китс и Невис",code:"kn"},
  {name:"Сент-Винсент и Гренадины",code:"vc"},
  // Южная Америка
  {name:"Бразилия",code:"br"},{name:"Аргентина",code:"ar"},
  {name:"Колумбия",code:"co"},{name:"Перу",code:"pe"},
  {name:"Чили",code:"cl"},{name:"Венесуэла",code:"ve"},
  {name:"Боливия",code:"bo"},{name:"Парагвай",code:"py"},
  {name:"Уругвай",code:"uy"},{name:"Эквадор",code:"ec"},
  {name:"Гайана",code:"gy"},{name:"Суринам",code:"sr"},
  // Океания
  {name:"Австралия",code:"au"},{name:"Новая Зеландия",code:"nz"},
  {name:"Папуа — Новая Гвинея",code:"pg"},{name:"Фиджи",code:"fj"},
  {name:"Соломоновы Острова",code:"sb"},{name:"Вануату",code:"vu"},
  {name:"Самоа",code:"ws"},{name:"Кирибати",code:"ki"},
  {name:"Тонга",code:"to"},{name:"Микронезия",code:"fm"},
  {name:"Палау",code:"pw"},{name:"Маршалловы Острова",code:"mh"},
  {name:"Науру",code:"nr"},{name:"Тувалу",code:"tv"},
];

// ── Helpers ───────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── DOM refs ──────────────────────────────────────────────────────
const screens = {
  start:  document.getElementById('start-screen'),
  game:   document.getElementById('game-screen'),
  result: document.getElementById('result-screen'),
};

const flagImg    = document.getElementById('flag-img');
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
const btnStart   = document.getElementById('btn-start');
const btnAgain   = document.getElementById('btn-again');

// ── State ─────────────────────────────────────────────────────────
const DURATION = 60;
const CIRCUMFERENCE = 2 * Math.PI * 50;

let correct = 0, wrong = 0;
let timeLeft = DURATION;
let timerInterval   = null;
let currentQuestion = null;
let answered        = false;
let queue           = [];

// ── Screen management ─────────────────────────────────────────────
function show(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ── Timer ring ────────────────────────────────────────────────────
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

// ── Question generation ───────────────────────────────────────────
function nextQuestion() {
  // Возвращает null когда все страны показаны — игра завершается
  if (queue.length === 0) return null;
  const country = queue.pop();
  const others  = shuffle(COUNTRIES.filter(c => c.name !== country.name)).slice(0, 3);
  const options = shuffle([...others, country]);
  return { code: country.code, correct: country.name, options: options.map(c => c.name) };
}

// ── Load question ─────────────────────────────────────────────────
async function loadQuestion() {
  answered = false;
  feedback.textContent = '';
  feedback.className   = 'feedback';
  optBtns.forEach(b => { b.disabled = false; b.className = 'opt-btn'; });

  flagStage.classList.add('flip');
  await sleep(200);

  const q = nextQuestion();

  // Все страны пройдены — заканчиваем игру
  if (!q) {
    flagStage.classList.remove('flip');
    endGame(true);
    return;
  }

  currentQuestion = q;

  flagImg.src = `https://flagcdn.com/w320/${currentQuestion.code}.png`;
  flagImg.alt = currentQuestion.correct;

  currentQuestion.options.forEach((opt, i) => {
    optBtns[i].querySelector('.opt-text').textContent = opt;
  });

  flagStage.classList.remove('flip');
}

// ── Answer handling ───────────────────────────────────────────────
function handleAnswer(idx) {
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

  // Не грузим следующий вопрос если таймер уже остановил игру
  if (timeLeft > 0) loadQuestion();
}

// ── End game ──────────────────────────────────────────────────────
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
    pctText.textContent = pct + '% правильных';
  });

  const trophy = document.getElementById('result-trophy');
  trophy.textContent = pct >= 80 ? '🏆' : pct >= 50 ? '🥈' : '🌍';

  // Если прошли все страны — показываем особый заголовок
  const resultTitle = document.querySelector('.result-title');
  if (resultTitle) {
    resultTitle.textContent = allDone
      ? '🎉 Все страны пройдены!'
      : 'Игра окончена!';
  }

  // ── Сохранение результата в localStorage ──────────────────────
  const RECORD_KEY = 'v1_record';
  const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  // Всегда сохраняем последний результат (для result.html)
  localStorage.setItem('v1_last', JSON.stringify({ correct, wrong, total, pct, date }));

  // Обновляем рекорд если побит
  const saved = JSON.parse(localStorage.getItem(RECORD_KEY) || 'null');
  const isNewRecord = !saved || correct > saved.correct;
  if (isNewRecord) {
    localStorage.setItem(RECORD_KEY, JSON.stringify({ correct, wrong, total, pct, date }));
  }

  // Показываем / скрываем баннер нового рекорда
  const banner = document.getElementById('new-record-banner');
  if (banner) banner.style.display = isNewRecord ? 'flex' : 'none';

  // ── Шаринг: генерируем ключ, сохраняем результат, строим ссылку ──
  const key = Array.from(crypto.getRandomValues(new Uint8Array(5)))
    .map(b => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36])
    .join('');
  localStorage.setItem('v1_result_' + key, JSON.stringify({ correct, wrong, total, pct, date }));

  const base     = location.href.replace(/\/[^/]*(\?.*)?$/, '/');
  const shareUrl = document.getElementById('share-url');
  if (shareUrl) shareUrl.value = base + 'result.html#' + key;

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

// ── Game start ────────────────────────────────────────────────────
function startGame() {
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
