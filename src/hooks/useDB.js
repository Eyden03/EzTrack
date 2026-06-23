import { useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { initDB } from '@/lib/db'

export function useDB() {
  const { dispatch } = useApp()

  useEffect(() => {
    let cancelled = false
    initDB().then(() => {
      if (!cancelled) dispatch({ type: 'DB_READY' })
    })
    return () => { cancelled = true }
  }, [dispatch])
}
