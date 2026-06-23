import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'
import { api } from '@/lib/api'
import { AI_RESPONSES } from '@/data/aiResponses'
import { getSuggestionChips } from '@/data/suggestionChips'
import { toast } from 'sonner'

export default function AITab() {
  const { state, dispatch } = useApp()
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Kamusta! I've been watching your finances. This week you earned <strong>₱6,020</strong> and spent <strong>₱1,200</strong> on supplies. Net: <strong>₱4,820</strong>. Maganda! Anything you want to check?",
      ts: '8:02 AM',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const queriesRemaining = state.simulaQueriesRemaining
  const tier = state.tier
  const isSimulaExhausted = tier === CONFIG.TIERS.SIMULA && queriesRemaining <= 0

  function keywordReply(msg) {
    const lower = msg.toLowerCase()
    for (const key of Object.keys(AI_RESPONSES)) {
      if (lower.includes(key)) return AI_RESPONSES[key]
    }
    return "Thanks for your message! I'm currently in offline mode. Please upgrade to Sigla or Unlad for full AI chat with live data access."
  }

  function buildContext() {
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - CONFIG.WEEKLY_LOOKBACK_DAYS)
    const weekTx = state.transactions.filter(t => new Date(t.date) >= weekAgo)
    const weeklyIncome = weekTx.filter(t => t.type === 'inc').reduce((s, t) => s + t.amt, 0)
    const weeklyExpenses = weekTx.filter(t => t.type === 'exp').reduce((s, t) => s + t.amt, 0)
    const cats = {}
    state.transactions.filter(t => t.type === 'exp').forEach(t => { cats[t.cat] = (cats[t.cat] || 0) + t.amt })
    const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0]
    return {
      profileId: state.profileId,
      bizName: state.business?.name || 'Unnamed Business',
      tier: state.tier,
      cashToday: state.transactions.filter(t => t.date === new Date().toISOString().slice(0, 10))
        .reduce((s, t) => s + (t.type === 'inc' ? t.amt : -t.amt), 0),
      weeklyIncome,
      weeklyExpenses,
      topCategory: topCat?.[0] || 'N/A',
      topCategoryAmount: topCat?.[1] || 0,
      recentTransactions: state.transactions.slice(0, CONFIG.AI_CONTEXT_TX_LIMIT),
      inventory: state.inventory,
      customers: state.customers,
      goals: state.goals,
    }
  }

  async function refreshState() {
    try {
      const fresh = await api.post('/refresh/' + state.profileId)
      dispatch({ type: 'LOGIN', payload: fresh })
    } catch {}
  }

  async function callLLM(messages, ctx) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, context: ctx }),
      })
      if (!res.ok) return null
      const data = await res.json()
      return { reply: data.choices?.[0]?.message?.content || '' }
    } catch {
      return null
    }
  }

  async function handleSend(text) {
    if (!text.trim()) return
    if (isSimulaExhausted) {
      toast.error('No AI queries remaining. Upgrade to Sigla for unlimited access.')
      return
    }

    const userMsg = { role: 'user', text: text.trim(), ts: new Date().toLocaleTimeString(CONFIG.LOCALE, { hour: 'numeric', minute: '2-digit' }) }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    if (tier === CONFIG.TIERS.SIMULA) dispatch({ type: 'DECREMENT_QUERY' })

    const ctx = buildContext()
    const chatHistory = messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.text }))
    chatHistory.push({ role: 'user', content: text.trim() })
    const result = await callLLM(chatHistory, ctx)
    const reply = result ? result.reply : keywordReply(text.trim())

    await refreshState()

    const aiMsg = { role: 'ai', text: reply, ts: userMsg.ts }
    setMessages(prev => [...prev, aiMsg])
    setIsTyping(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSend(input)
  }

  const chips = getSuggestionChips(tier)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="text-[11px] text-gray-400 text-center">
          {tier === CONFIG.TIERS.SIMULA
            ? `${queriesRemaining} of ${CONFIG.AI_QUERY_LIMIT} AI queries remaining this month`
            : 'Unlimited AI queries'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
              <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.text }} />
              <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.ts}</div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {!isSimulaExhausted && chips.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 space-y-2">
          {chips.map((group, gi) => (
            <div key={gi}>
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">{group.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {group.chips.map((chip, ci) => (
                  <button key={ci} onClick={() => handleSend(chip.msg)}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isSimulaExhausted ? (
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            You've used all your AI queries this month.{' '}
            <span className="text-blue-600 font-semibold">Upgrade to Sigla</span> for unlimited access.
          </p>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ask about your finances..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors" />
            <button onClick={() => handleSend(input)} disabled={!input.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
