/* ============================================================
   EzTrack – Utilities
   Show/hide helpers, toast notifications, small shared helpers.
   Loaded early since other modules (auth, modals, etc.) call
   show() / hide() / showToast() directly.
   ============================================================ */

function show(id) { document.getElementById(id)?.classList.remove('hide'); }
function hide(id) { document.getElementById(id)?.classList.add('hide'); }

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

function setBizProfilesInfo() {
  const counts = { simula: '1 of 1', sigla: '1 of 2', unlad: '2 of 5' };
  const el = document.getElementById('biz-profiles-count');
  if (el) el.textContent = counts[STATE.tier] || '1';
}
