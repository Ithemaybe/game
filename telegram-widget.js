'use strict';

(function () {
  const CHANNEL_USERNAME = 'sptf_team';
  const CHANNEL_URL = 'https://t.me/' + CHANNEL_USERNAME;

  function label() {
    const lang = localStorage.getItem('site_lang');
    if (lang === 'en') return 'Telegram channel';
    if (lang === 'uk') return 'Телеграм-канал';
    return 'Телеграм-канал';
  }

  const link = document.createElement('a');
  link.className = 'tg-channel-btn';
  link.href = CHANNEL_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', label());
  link.innerHTML = `
    <span class="tg-channel-icon" aria-hidden="true">
      <svg viewBox="0 0 240 240" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="120" cy="120" r="120" fill="#229ED9"/>
        <path fill="#fff" d="M170.6 72.3 148 178.6c-1.7 7.6-6.2 9.5-12.6 5.9l-34.9-25.7-16.8 16.2c-1.9 1.9-3.4 3.4-7 3.4l2.5-35.7 65-58.7c2.8-2.5-.6-3.9-4.4-1.4l-80.3 50.6-34.6-10.8c-7.5-2.3-7.7-7.5 1.6-11.1l135.4-52.2c6.3-2.3 11.8 1.5 9.7 11.2z"/>
      </svg>
    </span>
    <span class="tg-channel-label">${label()}</span>
  `;

  document.body.appendChild(link);

  document.addEventListener('langchange', () => {
    link.setAttribute('aria-label', label());
    const labelEl = link.querySelector('.tg-channel-label');
    if (labelEl) labelEl.textContent = label();
  });
})();
