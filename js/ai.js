/* ============================================================
   EzTrack – AI Chat Tab
   Chat rendering, quick-reply buttons, keyword-matched demo
   replies (AI_CHAT / AI_RESPONSES live in state.js).
   Simula gets limited queries (10/month) instead of a lock.
   ============================================================ */

function renderAITab() {
  const el = document.getElementById('ai-content');
  if (!el) return;

  const remaining = STATE.tier === 'simula' ? STATE.simulaQueriesRemaining : -1;

  const qbs = STATE.tier === 'simula'
    ? ['Am I earning or losing?', 'Can I restock this week?']
    : STATE.tier === 'unlad'
      ? ['Can I afford to hire?', 'Am I on track for my goal?', 'Forecast next 30 days', 'BIR deadline status', 'P&L this month']
      : ['How much did I spend last week?', 'Which category is highest?', 'Am I earning or losing?', 'Can I restock this week?'];

  const chatHtml = `
    <div class="chat-counter" id="ai-counter">
      ${remaining >= 0
        ? `<span class="cc-text">${remaining} AI ${remaining === 1 ? 'query' : 'queries'} remaining this month</span>
           <span class="cc-upgrade" onclick="goTo('page-plans');renderPlans();">Upgrade to Sigla</span>`
        : `<span class="cc-text">Unlimited AI queries</span>`}
    </div>
    <div class="chat-messages" id="chat-msgs">
      ${AI_CHAT.messages.map(m => `
        <div class="chat-msg ${m.role}">${m.text}</div>
        <div class="chat-ts ${m.role}-ts">${m.ts}</div>
      `).join('')}
    </div>
    <div class="quick-btns" id="ai-quick-btns">
      ${qbs.map(q => `<button class="qb" onclick="sendAI('${q}')">${q}</button>`).join('')}
    </div>
    <div class="chat-bar">
      ${remaining === 0
        ? `<div class="chat-bar-locked">You've used all your AI queries this month. <a onclick="goTo('page-plans');renderPlans();">Upgrade to Sigla</a> for unlimited access.</div>`
        : `<input class="chat-input-field" id="ai-input" placeholder="Ask about your finances…" onkeydown="if(event.key==='Enter')sendAIFromInput()"/>
           <button class="chat-send" onclick="sendAIFromInput()">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
           </button>`}
    </div>`;

  el.innerHTML = chatHtml;
}

function sendAIFromInput() {
  const inp = document.getElementById('ai-input');
  const msg = inp ? inp.value.trim() : '';
  if (msg) { inp.value = ''; sendAI(msg); }
}

function sendAI(msg) {
  const msgsEl = document.getElementById('chat-msgs');
  if (!msgsEl) return;

  /* Simula: check query limit */
  if (STATE.tier === 'simula' && STATE.simulaQueriesRemaining <= 0) {
    showToast('No AI queries remaining. Upgrade to Sigla for unlimited access.');
    return;
  }

  const now = new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

  if (STATE.tier === 'simula') STATE.simulaQueriesRemaining--;

  msgsEl.innerHTML += `<div class="chat-msg user">${msg}</div><div class="chat-ts user-ts">${now}</div>`;
  msgsEl.innerHTML += `<div class="chat-msg ai" id="typing-indicator">Checking your records…</div>`;
  msgsEl.scrollTop = msgsEl.scrollHeight;

  setTimeout(() => {
    const key   = Object.keys(AI_RESPONSES).find(k => msg.toLowerCase().includes(k));
    const reply = key ? AI_RESPONSES[key] : 'I can see your recent transactions. Want me to check if you\'re earning or losing this week?';
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.outerHTML = `<div class="chat-msg ai">${reply}</div><div class="chat-ts ai-ts">${now}</div>`;
    if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
    AI_CHAT.messages.push({ role: 'user', text: msg, ts: now }, { role: 'ai', text: reply, ts: now });

    /* Update the counter badge after reply */
    if (STATE.tier === 'simula') {
      const counter = document.getElementById('ai-counter');
      if (counter) {
        const r = STATE.simulaQueriesRemaining;
        counter.innerHTML = r > 0
          ? `<span class="cc-text">${r} AI ${r === 1 ? 'query' : 'queries'} remaining this month</span>
             <span class="cc-upgrade" onclick="goTo('page-plans');renderPlans();">Upgrade to Sigla</span>`
          : `<span class="cc-text" style="color:var(--red-600)">0 AI queries remaining this month</span>
             <span class="cc-upgrade" onclick="goTo('page-plans');renderPlans();">Upgrade to Sigla</span>`;
      }
      /* Disable the input + buttons when exhausted */
      if (STATE.simulaQueriesRemaining <= 0) {
        const bar = document.querySelector('.chat-bar');
        if (bar) bar.innerHTML = '<div class="chat-bar-locked">You\'ve used all your AI queries this month. <a onclick="goTo(\'page-plans\');renderPlans();">Upgrade to Sigla</a> for unlimited access.</div>';
        const btns = document.getElementById('ai-quick-btns');
        if (btns) btns.innerHTML = '';
      }
    }
  }, 900);
}
