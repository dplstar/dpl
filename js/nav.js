/* ═══════════════════ NAV ═══════════════════
   Highlights the current page's link and drives the mobile menu.
   Each page sets <body data-page="home|about|products|contact">. */

(function () {
  const current = document.body.dataset.page;

  document.querySelectorAll('.nav-a[data-page]').forEach((a) => {
    a.classList.toggle('on', a.dataset.page === current);
  });

  const burger = document.getElementById('burger');
  const mobNav = document.getElementById('mob-nav');

  if (burger && mobNav) {
    burger.addEventListener('click', function () {
      const open = mobNav.classList.toggle('open');
      this.innerHTML = open
        ? '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>'
        : '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    });
  }
})();
