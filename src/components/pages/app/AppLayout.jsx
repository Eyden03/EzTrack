import { Outlet } from 'react-router-dom'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout() {
  return (
    <div className="flex flex-col h-full">
      <TopBar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
