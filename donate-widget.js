'use strict';

(function () {
  const TON_ADDRESS = 'UQBhxgQqP852YxUm5Ku-40H0tCNnskoNTW49tVvLrYn-9-Ks';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ton-donate-btn';
  btn.setAttribute('aria-label', 'Задонатить в TON');
  btn.textContent = '💎 Донат';

  const panel = document.createElement('div');
  panel.className = 'ton-donate-panel';
  panel.innerHTML = `
    <button type="button" class="ton-donate-close" aria-label="Закрыть">✕</button>
    <p>Спасибо за поддержку проекта! Адрес TON-кошелька:</p>
    <div class="ton-donate-row">
      <input class="ton-donate-input" id="ton-donate-address" readonly value="${TON_ADDRESS}">
      <button type="button" class="ton-donate-copy">Копировать</button>
    </div>
    <a class="ton-donate-open" href="ton://transfer/${TON_ADDRESS}">Открыть в кошельке</a>
  `;

  document.body.appendChild(panel);
  document.body.appendChild(btn);

  const closeBtn = panel.querySelector('.ton-donate-close');
  const copyBtn  = panel.querySelector('.ton-donate-copy');
  const input    = panel.querySelector('.ton-donate-input');

  btn.addEventListener('click', () => panel.classList.toggle('open'));
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  copyBtn.addEventListener('click', () => {
    const done = () => {
      copyBtn.textContent = 'Скопировано!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Копировать';
        copyBtn.classList.remove('copied');
      }, 1500);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(input.value).then(done).catch(() => {
        input.select();
        document.execCommand('copy');
        done();
      });
    } else {
      input.select();
      document.execCommand('copy');
      done();
    }
  });

  document.addEventListener('click', (e) => {
    if (!panel.classList.contains('open')) return;
    if (panel.contains(e.target) || btn.contains(e.target)) return;
    panel.classList.remove('open');
  });
})();
