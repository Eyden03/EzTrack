/* ============================================================
   EzTrack – Modals
   Generic open/close/overlay-click, "Log Transaction" modal,
   and the Language modal. (The "Add Inventory Item" modal's
   submit handler lives in inventory.js, since it's inventory
   data being mutated.)
   ============================================================ */

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');

  if (id === 'modal-log') {
    document.getElementById('log-date').value = new Date().toISOString().split('T')[0];
    const catGrp  = document.getElementById('log-cat-grp');
    const noteGrp = document.getElementById('log-note-grp');
    if (catGrp)  catGrp.style.display  = STATE.tier !== 'simula' ? 'block' : 'none';
    if (noteGrp) noteGrp.style.display = STATE.tier !== 'simula' ? 'block' : 'none';
  }
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

function overlayClose(e, id) {
  if (e.target.id === id) closeModal(id);
}

/* ──────────────────────────────
   Log Transaction modal
────────────────────────────── */
function setTxType(t) {
  STATE.txType = t;
  document.getElementById('ttype-inc').classList.toggle('active', t === 'inc');
  document.getElementById('ttype-exp').classList.toggle('active', t === 'exp');
}

function submitLog() {
  const amt  = parseFloat(document.getElementById('log-amt').value);
  const desc = document.getElementById('log-desc').value.trim();
  if (!amt || amt <= 0) { showToast('Please enter a valid amount'); return; }
  if (!desc) { showToast('Please add a description'); return; }

  const now     = new Date();
  const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toISOString().split('T')[0];
  const cat     = document.getElementById('log-cat')?.value || '';

  const newId = DB.addTransaction({
    profile_id: STATE.profileId,
    type: STATE.txType,
    desc, amt, date: dateStr, cat, time: timeStr,
  });

  STATE.transactions.unshift({
    id: newId, profile_id: STATE.profileId,
    type: STATE.txType, desc, amt, date: dateStr, cat, time: timeStr,
  });

  closeModal('modal-log');
  document.getElementById('log-amt').value  = '';
  document.getElementById('log-desc').value = '';

  renderTxList();
  renderStats();
  showToast('Transaction saved ✓');
}

/* ──────────────────────────────
   Language modal
────────────────────────────── */
function setAppLang(l) {
  const checkSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--blue-600)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`;

  document.getElementById('lang-check-taglish').innerHTML = l === 'taglish' ? checkSVG : '';
  document.getElementById('lang-check-english').innerHTML = l === 'english' ? checkSVG : '';

  closeModal('modal-lang');
  showToast('Language updated');
}
