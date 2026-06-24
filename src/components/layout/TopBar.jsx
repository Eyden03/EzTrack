import { Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import NotificationsModal from '@/components/modals/NotificationsModal'
import { Bell, User } from 'lucide-react'

const BLUE = '#1a3fdb'

export default function TopBar() {
  const { state } = useApp()
  const initials = state.user?.avatar || state.user?.name?.charAt(0) || '?'

  return (
    <div
      className="flex items-center justify-between shrink-0"
      style={{ background: '#ffffff', padding: '14px 16px 12px', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center shrink-0 overflow-hidden"
          style={{ width: '36px', height: '36px', borderRadius: '8px', background: BLUE }}
        >
          <img src="/assets/images/logo-removebg.png" alt="EzTrack" className="w-full h-full object-cover" />
        </div>
        <span style={{ fontSize: '22px', fontWeight: 500, color: BLUE, lineHeight: '36px' }}>EzTrack</span>
      </div>

      <div className="flex items-center gap-1">
        <NotificationsModal>
          <button
            className="flex items-center justify-center relative cursor-pointer transition-all hover:brightness-95"
            style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${BLUE}08`, border: 'none' }}
          >
            <Bell size={18} color={BLUE} strokeWidth={2} />
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#f87171',
                position: 'absolute',
                top: '6px',
                right: '6px',
                border: '1.5px solid #ffffff',
              }}
            />
          </button>
        </NotificationsModal>

        <Link
          to="/app/profile"
          className="flex items-center justify-center transition-all hover:brightness-95"
          style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${BLUE}08` }}
        >
          {state.user?.avatar ? (
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: '32px',
                height: '32px',
                background: BLUE,
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {initials}
            </div>
          ) : (
            <User size={18} color={BLUE} strokeWidth={2} />
          )}
        </Link>
      </div>
    </div>
  )
}
