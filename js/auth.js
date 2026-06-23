/* ============================================================
   EzTrack – Authentication & Onboarding
   Login · Register · Business setup · Telegram setup · Logout
   ============================================================ */

/* ── Setup wizard local state ── */
let setupBizType = 'sari';
let appLang      = 'taglish';

/* ──────────────────────────────
   Helpers
────────────────────────────── */
function togglePwd(inputId, btn) {
  const inp   = document.getElementById(inputId);
  const isText = inp.type === 'text';
  inp.type = isText ? 'password' : 'text';
  btn.querySelector('svg').style.opacity = isText ? '1' : '.45';
}

/* ──────────────────────────────
   Login
────────────────────────────── */
function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  let ok = true;

  if (!email.includes('@')) {
    show('login-email-err');
    document.getElementById('login-email').classList.add('err');
    ok = false;
  } else {
    hide('login-email-err');
    document.getElementById('login-email').classList.remove('err');
  }

  if (pass.length < 6) {
    show('login-pass-err');
    document.getElementById('login-pass').classList.add('err');
    ok = false;
  } else {
    hide('login-pass-err');
    document.getElementById('login-pass').classList.remove('err');
  }

  if (!ok) return;

  // There's no real backend here, so "logging in" means: restore whatever
  // profile this browser previously registered/set up (ez_user / ez_biz).
  // If none exists yet, build a sensible placeholder from the email instead
  // of a hardcoded demo name — that was the source of the name mismatch.
  const savedUser = localStorage.getItem('ez_user');
  const savedBiz  = localStorage.getItem('ez_biz');

  STATE.user = savedUser ? JSON.parse(savedUser) : buildPlaceholderUser(email);
  STATE.biz  = savedBiz  ? JSON.parse(savedBiz)  : { name: 'My Business', type: 'sari', city: '', lang: 'taglish' };
  STATE.tier = localStorage.getItem('ez_tier') || 'simula';
  launchApp();
}

/* Derives a friendly display name + initials from an email address,
   used only when no profile has been registered on this device yet. */
function buildPlaceholderUser(email) {
  const handle = email.split('@')[0].replace(/[._]+/g, ' ').trim();
  const name = handle.replace(/\b\w/g, c => c.toUpperCase()) || 'New User';
  const initials = name.split(' ').filter(Boolean).map(w => w.charAt(0).toUpperCase()).slice(0, 2).join('') || 'U';
  return { name, email, avatar: initials };
}

/* ──────────────────────────────
   Register
────────────────────────────── */
function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  let ok = true;

  if (!email.includes('@')) { show('reg-email-err'); ok = false; } else { hide('reg-email-err'); }
  if (pass.length < 6)       { show('reg-pass-err'); ok = false; } else { hide('reg-pass-err'); }
  if (pass !== pass2)        { show('reg-pass2-err');ok = false; } else { hide('reg-pass2-err'); }
  if (!ok) return;

  const initials =
    (name ? name.charAt(0).toUpperCase() : 'N') +
    (name.split(' ')[1] ? name.split(' ')[1].charAt(0).toUpperCase() : 'U');

  STATE.user = { name: name || 'New User', email, avatar: initials };
  localStorage.setItem('ez_user', JSON.stringify(STATE.user));
  goTo('page-plans');
  renderPlans();
}

/* ──────────────────────────────
   Logout
────────────────────────────── */
function doLogout() {
  localStorage.removeItem('ez_tier');
  goTo('page-login');
}

/* ──────────────────────────────
   Business setup – Step 1
────────────────────────────── */
function selectBizType(el) {
  document.querySelectorAll('.biz-type-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  setupBizType = el.dataset.type;
}

function setLang(l) {
  appLang = l;
  document.getElementById('lang-en').classList.toggle('selected', l === 'en');
  document.getElementById('lang-tl').classList.toggle('selected', l === 'en-only');
}

function setupNext() {
  const biz  = document.getElementById('setup-biz').value.trim() || 'My Business';
  const city = document.getElementById('setup-city').value.trim() || '';
  STATE.biz  = { name: biz, type: setupBizType, city, lang: appLang };
  // Generate random Telegram link code
  document.getElementById('tg-code').textContent =
    'EZT-' + Math.floor(1000 + Math.random() * 9000);
  goTo('page-setup2');
}

/* ──────────────────────────────
   Business setup – Step 2 (Telegram)
────────────────────────────── */
function finishSetup() {
  launchApp();
}

/* ──────────────────────────────
   Launch the main app
────────────────────────────── */
function launchApp() {
  // Fallback defaults (e.g. when coming from login with existing account)
  if (!STATE.biz)  STATE.biz  = { name:'Anning Sari-Sari Store', type:'sari', city:'Quezon City', lang:'taglish' };
  if (!STATE.user) STATE.user = { name:'Maria Anning', email:'maria@email.com', avatar:'MA' };

  goTo('page-app');
  renderTopbar();
  renderHomeTab();
  renderInventoryExtras();
}