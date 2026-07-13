'use strict';

(() => {
  const nav = document.querySelector('.mode-pills');
  if (!nav) return;

  const links = [...nav.querySelectorAll('a')];
  if (!links.length) return;

  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let dragging = false;
  let target = null;

  const pickLink = (x, y) => {
    const direct = document.elementFromPoint(x, y)?.closest('.mode-pills a');
    if (direct && nav.contains(direct)) return direct;

    // Разрешаем вести пальцем немного выше/ниже переключателя.
    return links.reduce((best, link) => {
      const rect = link.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(x - center);
      return !best || distance < best.distance ? { link, distance } : best;
    }, null)?.link || null;
  };

  const paintTarget = (link) => {
    links.forEach(item => item.classList.toggle('drag-target', item === link));
    target = link;
  };

  const reset = () => {
    nav.classList.remove('is-dragging');
    links.forEach(item => item.classList.remove('drag-target'));
    pointerId = null;
    dragging = false;
    target = null;
  };

  nav.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    const link = event.target.closest('a');
    if (!link) return;

    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    target = link;
    nav.setPointerCapture?.(pointerId);
  });

  nav.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (!dragging && Math.hypot(dx, dy) < 7) return;
    if (!dragging && Math.abs(dy) > Math.abs(dx) * 1.4) return;

    dragging = true;
    nav.classList.add('is-dragging');
    event.preventDefault();
    paintTarget(pickLink(event.clientX, event.clientY));
  });

  nav.addEventListener('pointerup', (event) => {
    if (event.pointerId !== pointerId) return;
    const chosen = target;
    const didDrag = dragging;
    reset();

    if (didDrag && chosen) {
      event.preventDefault();
      const href = chosen.getAttribute('href');
      if (href && !chosen.classList.contains('active')) location.href = href;
    }
  });

  nav.addEventListener('pointercancel', reset);
  nav.addEventListener('click', (event) => {
    if (dragging) event.preventDefault();
  });
})();
