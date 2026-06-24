import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import ProfileCard from '@/components/shared/ProfileCard'

export default function LoginPage() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/profiles').then(data => {
      setProfiles(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleLogin(profileId) {
    const state = await api.post('/login/' + profileId)
    dispatch({ type: 'LOGIN', payload: state })
    navigate('/app/home', { replace: true })
  }

  return (
    <div className="flex flex-col h-full px-6 pt-10">
      <div className="flex items-center gap-3 mb-8">
        <img src="/assets/images/logo-removebg.png" alt="EzTrack" className="w-12 h-12 rounded-xl" />
        <span className="text-lg font-extrabold text-gray-800">EzTrack</span>
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
        Welcome back,<br />Negosyante! <span className="not-italic">👋</span>
      </h1>
      <p className="text-sm text-gray-400 mt-1 mb-1">Choose a demo account to explore</p>
      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        This is a prototype — data is for demonstration only. Each account shows the features available at that tier.
      </p>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-40" />
              </div>
              <div className="h-6 w-16 rounded-full bg-gray-200 flex-shrink-0" />
            </div>
          ))
        ) : (
          profiles.map(p => (
            <ProfileCard key={p.id} profile={p} onSelect={handleLogin} />
          ))
        )}
      </div>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        onClick={() => toast.error('Create Account is currently unavailable. Please choose one of the demo accounts above.')}
        className="w-full py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold text-sm text-center hover:bg-gray-50 transition-colors"
      >
        Create New Account
      </button>

      <p className="text-[11px] text-gray-400 text-center mt-4 mb-6 leading-relaxed">
        By continuing, you agree to our{' '}
        <span className="text-blue-600 font-semibold">Terms</span> and{' '}
        <span className="text-blue-600 font-semibold">Privacy Policy</span>
      </p>
    </div>
  )
}
