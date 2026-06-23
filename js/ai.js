/* ============================================================
   EzTrack – AI Chat Tab
   Chat rendering, quick-reply buttons, keyword-matched demo
   replies (AI_CHAT / AI_RESPONSES live in state.js)
   ============================================================ */

function renderAITab() {
  const el = document.getElementById('ai-content');
  if (!el) return;

  if (STATE.tier === 'simula') {
    el.innerHTML = `
      <div class="ai-locked-state">
        <div class="ail-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
        <div style="font-size:18px;font-weight:800;color:var(--gray-800);margin-bottom:8px;">AI Assistant</div>
        <div style="font-size:14px;color:var(--gray-500);line-height:1.65;margin-bottom:28px;">
          Upgrade to Sigla to ask your AI assistant questions like:<br/><br/>
          • "Can I afford to restock this week?"<br/>
          • "How much did I spend on supplies last month?"<br/>
          • "Am I on track to earn ₱50K this month?"
        </div>
        <div class="upgrade-cta" onclick="goTo('page-plans');renderPlans();" style="width:100%;max-width:320px;">
          <div class="uc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
          <div class="uc-text"><div class="uc-title">Upgrade to Sigla</div><div class="uc-sub">₱249/month</div></div>
          <div class="uc-arr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div>
        </div>
      </div>`;
    return;
  }

  const qbs = STATE.tier === 'unlad'
    ? ['Can I afford to hire?', 'Am I on track for my goal?', 'Forecast next 30 days', 'BIR deadline status', 'P&L this month']
    : ['How much did I spend last week?', 'Which category is highest?', 'Am I earning or losing?', 'Can I restock this week?'];

  el.innerHTML = `
    <div class="chat-messages" id="chat-msgs">
      ${AI_CHAT.messages.map(m => `
        <div class="chat-msg ${m.role}">${m.text}</div>
        <div class="chat-ts ${m.role}-ts">${m.ts}</div>
      `).join('')}
    </div>
    <div class="quick-btns">
      ${qbs.map(q => `<button class="qb" onclick="sendAI('${q}')">${q}</button>`).join('')}
    </div>
    <div class="chat-bar">
      <input class="chat-input-field" id="ai-input" placeholder="Ask about your finances…" onkeydown="if(event.key==='Enter')sendAIFromInput()"/>
      <button class="chat-send" onclick="sendAIFromInput()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>`;
}

function sendAIFromInput() {
  const inp = document.getElementById('ai-input');
  const msg = inp ? inp.value.trim() : '';
  if (msg) { inp.value = ''; sendAI(msg); }
}

function sendAI(msg) {
  const msgsEl = document.getElementById('chat-msgs');
  if (!msgsEl) return;
  const now = new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

  msgsEl.innerHTML += `<div class="chat-msg user">${msg}</div><div class="chat-ts user-ts">${now}</div>`;
  msgsEl.innerHTML += `<div class="chat-msg ai" id="typing-indicator">Checking your records…</div>`;
  msgsEl.scrollTop = msgsEl.scrollHeight;

  setTimeout(() => {
    const key   = Object.keys(AI_RESPONSES).find(k => msg.toLowerCase().includes(k));
    const reply = key ? AI_RESPONSES[key] : "Based on your financial data, I'd recommend reviewing your expense categories this week. Want a quick breakdown of where your money went?";
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.outerHTML = `<div class="chat-msg ai">${reply}</div><div class="chat-ts ai-ts">${now}</div>`;
    if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
    AI_CHAT.messages.push({ role: 'user', text: msg, ts: now }, { role: 'ai', text: reply, ts: now });
  }, 900);
}
