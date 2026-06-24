import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

export default function AppLayout() {
  const { state } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (!state.profileId) {
      navigate('/login', { replace: true })
    }
  }, [state.profileId])

  return (
    <div className="flex flex-col h-dvh">
      <TopBar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-[72px]">
        <Outlet key={0} />
      </div>
      <BottomNav />
    </div>
  )
}
