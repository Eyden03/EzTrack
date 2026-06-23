/* ============================================================
   EzTrack – Profile Tab
   Account summary, subscription card, tier-gated support section
   ============================================================ */

function renderProfileTab() {
  const u = STATE.user || {};
  const b = STATE.business  || {};
  const bizIcons   = { sari:'🏪', food:'🍱', online:'📦', services:'🔧', retail:'🛍️', other:'💼' };
  const tierLabels = { simula:'Simula – Free', sigla:'Sigla – ₱249/month', unlad:'Unlad – ₱699/month' };

  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setTxt('prof-ava', u.avatar || 'U');
  setTxt('prof-name', u.name || 'User');
  setTxt('prof-biz', (bizIcons[b.type] || '💼') + ' ' + (b.name || 'My Business') + (b.city ? ' · ' + b.city : ''));
  setTxt('prof-tier-badge', tierLabels[STATE.tier]);

  setBizProfilesInfo();

  /* ── Subscription section ── */
  const subEl = document.getElementById('sub-section');
  if (subEl) {
    subEl.innerHTML = `
      <div class="settings-item">
        <div class="si-icon amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div><span class="si-label">${tierLabels[STATE.tier]}</span><div style="font-size:11px;color:var(--gray-400)">Current plan · Active</div></div>
        ${STATE.tier !== CONFIG.TIERS.UNLAD ? `<button onclick="goTo('page-plans');renderPlans();" style="background:var(--blue-600);color:white;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;">Upgrade</button>` : ''}
      </div>`;
  }

  /* ── Support section (channels gated by tier) ── */
  const supEl = document.getElementById('support-section');
  if (supEl) {
    let supH = `<div class="settings-item"><div class="si-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div><span class="si-label">Help Center</span><div class="si-right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div></div>`;

    if (STATE.tier === CONFIG.TIERS.SIGLA) {
      supH += `<div class="settings-item"><div class="si-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><span class="si-label">Email Support</span><div class="si-right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div></div>`;
    }
    if (STATE.tier === CONFIG.TIERS.UNLAD) {
      supH += `<div class="settings-item"><div class="si-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><span class="si-label">Live Chat Support</span><div class="si-right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div></div>`;
    }
    supEl.innerHTML = supH;
  }
}
