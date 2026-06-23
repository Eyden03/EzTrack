/* ============================================================
   EzTrack – Authentication & Onboarding
   Profile picker · Register · Business setup · Logout
   ============================================================ */

/* ── Setup wizard local state ── */
let setupBizType = 'sari';
let appLang      = 'taglish';

/* ──────────────────────────────
   Profile card picker
────────────────────────────── */
function renderProfileCards(profiles) {
  const grid = document.getElementById('profile-grid');
  if (!grid) return;

  const bizIcons = { sari:'🏪', food:'🍱', online:'📦', services:'🔧', retail:'🛍️', other:'💼' };
  const tierLabels = { simula:'Simula – Free', sigla:'Sigla – ₱249/mo', unlad:'Unlad – ₱699/mo' };
  const tierColors = { simula:'#4ADE80', sigla:'#60A5FA', unlad:'#FBBF24' };

  grid.innerHTML = profiles.map(p => `
    <div class="profile-card" onclick="loginAsProfile(${p.id})">
      <div class="pc-ava">${p.avatar}</div>
      <div class="pc-info">
        <div class="pc-name">${p.name}</div>
        <div class="pc-biz">${bizIcons[p.biz_type] || '💼'} ${p.biz_name}${p.biz_city ? ' · ' + p.biz_city : ''}</div>
      </div>
      <div class="pc-tier" style="--tier-color:${tierColors[p.tier]}">
        <div class="pc-tier-dot" style="background:${tierColors[p.tier]}"></div>
        ${tierLabels[p.tier] || p.tier}
      </div>
    </div>`).join('');
}

/* ──────────────────────────────
   Login
────────────────────────────── */
function loginAsProfile(id) {
  DB.loadState(id);
  launchApp();
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

  const id = DB.createProfile({
    name: name || 'New User', email, avatar: initials,
    biz_name: 'My Business', biz_type: 'sari', biz_city: '', lang: 'taglish', tier: 'simula',
  });

  STATE.user = { name: name || 'New User', email, avatar: initials };
  STATE.profileId = id;
  STATE.biz  = { name: 'My Business', type: 'sari', city: '', lang: 'taglish' };
  STATE.tier = 'simula';
  STATE.transactions = [];
  STATE.inventory = [];
  STATE.nextTxId = 1;

  goTo('page-plans');
  renderPlans();
}

/* ──────────────────────────────
   Logout
────────────────────────────── */
function doLogout() {
  STATE.profileId = null;
  STATE.user = null;
  STATE.biz  = null;
  STATE.transactions = [];
  STATE.inventory = [];
  STATE.nextTxId = 1;
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
  // Persist biz info to DB
  DB.updateProfile(STATE.profileId, {
    biz_name: biz, biz_type: setupBizType, biz_city: city, lang: appLang,
  });
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
  // Ensure fallback defaults
  if (!STATE.biz)  STATE.biz  = { name:'Anning Sari-Sari Store', type:'sari', city:'Quezon City', lang:'taglish' };
  if (!STATE.user) STATE.user = { name:'Maria Anning', email:'maria@email.com', avatar:'MA' };

  goTo('page-app');
  renderTopbar();
  renderHomeTab();
  renderInventoryExtras();
}
