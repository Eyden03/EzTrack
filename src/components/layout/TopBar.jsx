import { Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'

export default function TopBar() {
  const { state } = useApp()
  const tierMeta = CONFIG.TIER_META[state.tier]

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
          <svg viewBox="0 0 17 17" fill="none" stroke="white" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M3 4a2 2 0 012-2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4z" />
            <path d="M7 7l1.5 1.5L10 7" />
          </svg>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: tierMeta.color + '20', color: tierMeta.color }}>
          {tierMeta.label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button className="text-gray-400 hover:text-gray-600 relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <Link to="/app/profile" className="text-gray-400 hover:text-gray-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
