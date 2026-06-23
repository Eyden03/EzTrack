import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'
import { WEEKDATA } from '@/data/weekdata'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ReportsTab() {
  const { state } = useApp()
  const totalInc = state.transactions.filter(t => t.type === 'inc').reduce((s, t) => s + t.amt, 0)
  const totalExp = state.transactions.filter(t => t.type === 'exp').reduce((s, t) => s + t.amt, 0)
  const net = totalInc - totalExp
  const tier = state.tier

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Weekly Overview</div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
        <div className="text-xs font-bold text-gray-600 mb-3">Income vs Expenses</div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={WEEKDATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="income" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="expense" fill="#DC2626" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Income
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-600" /> Expenses
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase">Total Income</div>
          <div className="text-xl font-extrabold text-blue-600 mt-1">{CONFIG.CURRENCY_SYMBOL}{totalInc.toLocaleString()}</div>
        </div>
        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase">Total Expenses</div>
          <div className="text-xl font-extrabold text-red-600 mt-1">{CONFIG.CURRENCY_SYMBOL}{totalExp.toLocaleString()}</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
        <div className="text-[11px] font-semibold text-gray-400 uppercase">Net Earnings</div>
        <div className={`text-xl font-extrabold mt-1 ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {net >= 0 ? '+' : '-'}{CONFIG.CURRENCY_SYMBOL}{Math.abs(net).toLocaleString()}
        </div>
      </div>

      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Daily Streak</div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-800">Logging Streak</span>
          <span className="text-sm font-bold text-gray-800">🔥 5 days</span>
        </div>
        <div className="flex justify-between">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
            <div key={d} className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full ${i < 5 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <span className="text-[10px] text-gray-400">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {tier === CONFIG.TIERS.SIMULA && (
        <div className="space-y-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="w-5 h-5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-800">Monthly reports</div>
                <div className="text-xs text-gray-400">Sigla & above</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" className="w-5 h-5"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-800">Category breakdown</div>
                <div className="text-xs text-gray-400">Sigla & above</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            </div>
          </div>
        </div>
      )}

      {tier === CONFIG.TIERS.SIGLA && (
        <>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Monthly Summary — June</div>
          <div className="flex gap-3 mb-4">
            <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-[11px] font-semibold text-gray-400 uppercase">Income</div>
              <div className="text-lg font-extrabold text-gray-800 mt-1">₱18,450</div>
            </div>
            <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-[11px] font-semibold text-gray-400 uppercase">Expenses</div>
              <div className="text-lg font-extrabold text-gray-800 mt-1">₱7,820</div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
            <div className="text-[11px] font-semibold text-gray-400 uppercase">Net Earnings</div>
            <div className="text-lg font-extrabold text-green-600 mt-1">₱10,630</div>
          </div>

          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Expense Categories</div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4 space-y-3">
            {[
              { cat: 'Supplies', pct: 52, amt: 3200 },
              { cat: 'Labor', pct: 29, amt: 1800 },
              { cat: 'Utilities', pct: 13, amt: 800 },
              { cat: 'Marketing', pct: 7, amt: 450 },
              { cat: 'Miscellaneous', pct: 9, amt: 570 },
            ].map(c => (
              <div key={c.cat}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700">{c.cat}</span>
                  <span className="text-gray-400">{c.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-blue-600" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Sales Trends</div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Best Day</div>
                <div className="text-sm font-bold text-green-600">Friday (₱1,240 avg)</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Worst Day</div>
                <div className="text-sm font-bold text-red-600">Tuesday (₱580 avg)</div>
              </div>
            </div>
          </div>
        </>
      )}

      {tier === CONFIG.TIERS.UNLAD && (
        <>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">30-Day Cash Forecast</div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-amber-800">Projected ₱46,800</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-700">At Risk</span>
            </div>
            <p className="text-xs text-amber-700">May fall ₱3,200 short if supplies cost trend continues</p>
          </div>

          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">P&L Report — June</div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4 space-y-3">
            {[
              { lbl: 'Gross Revenue', amt: 61200, cls: '' },
              { lbl: 'COGS', amt: 28400, cls: 'dn' },
              { lbl: 'Operating Expenses', amt: 9200, cls: 'dn' },
              { lbl: 'Net Profit', amt: 23600, cls: 'up' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{r.lbl}</span>
                <span className={`text-xs font-bold ${r.cls === 'up' ? 'text-green-600' : r.cls === 'dn' ? 'text-red-600' : 'text-gray-800'}`}>
                  {r.cls === 'dn' ? '-' : ''}₱{r.amt.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1 mb-2">Accounts Receivable</div>
          <div className="space-y-2 mb-4">
            {[
              { name: 'Sari Foods Supply', amt: 2400, days: 30, overdue: false },
              { name: 'Reyes Canteen', amt: 1800, days: 15, overdue: true },
            ].map((ar, i) => (
              <div key={i} className={`rounded-xl border p-4 ${ar.overdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{ar.name}</span>
                  <span className={`text-sm font-bold ${ar.overdue ? 'text-red-600' : 'text-gray-800'}`}>₱{ar.amt.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-400">{ar.days} days outstanding{ar.overdue ? ' · Overdue' : ''}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <button className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-[.98] transition-all mt-2 flex items-center justify-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M6 18L18 6M6 6l12 12" /><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Generate Report
      </button>
    </div>
  )
}
