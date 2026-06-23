/* ============================================================
   EzTrack – App Bootstrap
   Pre-renders the plan picker, runs the splash sequence,
   then hands off to the login screen. Loaded last so every
   render/navigation function it calls already exists.
   ============================================================ */

window.addEventListener('load', () => {
  renderPlans();

  setTimeout(() => {
    const splash = document.getElementById('page-splash');
    splash.style.opacity = '0';
    splash.style.transition = 'opacity .55s ease';

    setTimeout(() => {
      splash.classList.remove('active');
      goTo('page-login');
    }, 560);
  }, 2300);
});
