(function () {
  var STORAGE_KEY = 'site_lang';
  var LANG_META = {
    ru: { flag: '🇷🇺', code: 'RU' },
    en: { flag: '🇬🇧', code: 'EN' }
  };

  var dict = window.__I18N__ || {};
  var langs = Object.keys(dict);
  if (!langs.length) return;

  var current = localStorage.getItem(STORAGE_KEY);
  if (langs.indexOf(current) === -1) current = langs.indexOf('ru') !== -1 ? 'ru' : langs[0];

  function applyLang(lang) {
    var t = dict[lang];
    if (!t) return;

    document.documentElement.setAttribute('lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) el.innerHTML = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) el.setAttribute('placeholder', t[key]);
    });
    if (t.__title) document.title = t.__title;

    current = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    document.querySelectorAll('.lang-btn[data-lang]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    var flagEl = document.getElementById('lang-current-flag');
    var codeEl = document.getElementById('lang-current-code');
    var meta = LANG_META[lang] || { flag: '🏳️', code: lang.toUpperCase() };
    if (flagEl) flagEl.textContent = meta.flag;
    if (codeEl) codeEl.textContent = meta.code;

    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  function buildWidget() {
    var wrap = document.createElement('div');
    wrap.className = 'lang-switcher';

    var pill = document.createElement('div');
    pill.className = 'lang-pill';

    var curBtn = document.createElement('button');
    curBtn.type = 'button';
    curBtn.className = 'lang-btn current';
    curBtn.setAttribute('aria-haspopup', 'listbox');
    curBtn.setAttribute('aria-expanded', 'false');
    curBtn.setAttribute('aria-label', 'Выбрать язык / Choose language');
    curBtn.innerHTML =
      '<span class="lang-flag" id="lang-current-flag"></span>' +
      '<span id="lang-current-code"></span>' +
      '<svg class="lang-chevron" width="9" height="9" viewBox="0 0 10 10" fill="none">' +
      '<path d="M1 3l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    pill.appendChild(curBtn);

    langs.forEach(function (lang) {
      var meta = LANG_META[lang] || { flag: '🏳️', code: lang.toUpperCase() };
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-btn';
      btn.setAttribute('data-lang', lang);
      btn.setAttribute('role', 'option');
      btn.innerHTML = '<span class="lang-flag">' + meta.flag + '</span><span>' + meta.code + '</span>';
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        applyLang(lang);
        pill.classList.remove('open');
        curBtn.setAttribute('aria-expanded', 'false');
      });
      pill.appendChild(btn);
    });

    curBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = pill.classList.toggle('open');
      curBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', function () {
      pill.classList.remove('open');
      curBtn.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        pill.classList.remove('open');
        curBtn.setAttribute('aria-expanded', 'false');
      }
    });

    wrap.appendChild(pill);
    document.body.appendChild(wrap);
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildWidget();
    applyLang(current);
  });
})();
