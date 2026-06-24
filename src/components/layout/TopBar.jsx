import { Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { CONFIG } from '@/config'
import NotificationsModal from '@/components/modals/NotificationsModal'
import { Bell, User } from 'lucide-react'

const DOT_COLORS = {
  simula: '#facc15',
  sigla: '#facc15',
  unlad: '#4ade80',
}

export default function TopBar() {
  const { state } = useApp()

  const dotColor = DOT_COLORS[state.tier] || '#facc15'
  const label = CONFIG.TIER_META[state.tier]?.label || state.tier
  const initials = state.user?.avatar || state.user?.name?.charAt(0) || '?'

  return (
    <div
      className="flex items-center justify-between shrink-0"
      style={{
        background: '#ffffff',
        padding: '10px 16px',
        borderBottom: '0.5px solid #e5e7eb',
      }}
    >
      <div className="flex items-center gap-0.2">
        <div
          className="flex items-center justify-center shrink-0 overflow-hidden"
          style={{ width: '60px', height: '60px' }}
        >
          <img src="/assets/images/logo-removebg.png" alt="EzTrack" className="w-full h-full object-cover" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#1a3fdb', lineHeight: 1.2 }}>
            EzTrack
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
            <span style={{ fontSize: '10px', color: '#9ca3af', lineHeight: 1 }}>{label}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center" style={{ gap: '10px' }}>
        <NotificationsModal>
          <button
            className="flex items-center justify-center relative cursor-pointer"
            style={{ width: '20px', height: '20px', background: 'none', border: 'none', padding: 0 }}
          >
            <Bell size={20} color="#6b7280" strokeWidth={2} />
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#f87171',
                position: 'absolute',
                top: '-1px',
                right: '-1px',
                border: '1.5px solid #ffffff',
              }}
            />
          </button>
        </NotificationsModal>

        <Link
          to="/app/profile"
          className="flex items-center justify-center rounded-full"
          style={{
            width: '32px',
            height: '32px',
            background: state.user?.avatar ? '#e8edfb' : 'transparent',
          }}
        >
          {state.user?.avatar ? (
            <span style={{ fontSize: '11px', fontWeight: 500, color: '#1a3fdb' }}>
              {initials}
            </span>
          ) : (
            <User size={20} color="#6b7280" strokeWidth={2} />
          )}
        </Link>
      </div>
    </div>
  )
}
