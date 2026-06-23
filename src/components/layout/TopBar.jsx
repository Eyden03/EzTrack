import { Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'
import NotificationsModal from '@/components/modals/NotificationsModal'

function LogoIcon() {
  return (
    <svg viewBox="0 0 17 17" fill="none" className="w-[17px] h-[17px]">
      <rect x="1" y="4" width="10" height="9" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect x="2.5" y="5.5" width="7" height="1.5" rx=".75" fill="white" />
      <rect x="2.5" y="8.5" width="5" height="1.2" rx=".6" fill="rgba(255,255,255,0.55)" />
      <circle cx="13.5" cy="12" r="3.5" fill="rgba(255,255,255,0.85)" />
      <path d="M12 12l1.2 1.2L15.5 10.5" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function TopBar() {
  const { state } = useApp()
  const tierMeta = CONFIG.TIER_META[state.tier]

  return (
    <div className="bg-blue-800 px-5 py-3.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <LogoIcon />
        </div>
        <div>
          <div className="text-lg font-extrabold text-white">EzTrack</div>
          <div className="inline-flex items-center gap-[5px] px-2.5 py-[3px] rounded-full bg-white/15 text-white/90 border border-white/20 text-[11px] font-bold mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tierMeta.color }} />
            {tierMeta.label}
          </div>
        </div>
      </div>
      <div className="flex gap-1.5">
        <NotificationsModal>
          <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/85 hover:bg-white/20 transition-colors relative cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span className="absolute top-[5px] right-[5px] w-2 h-2 rounded-full bg-red-400 border-[1.5px] border-blue-800" />
          </button>
        </NotificationsModal>
        <Link
          to="/app/profile"
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/85 hover:bg-white/20 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[19px] h-[19px]">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
