'use client'

import { useState, useEffect, useCallback } from 'react'
import { LoginScreen } from './LoginScreen'
import { isSessionActive, clearSession } from '@/lib/auth'
import { db } from '@/lib/db'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  // TEMPORARILY BYPASS AUTHENTICATION PER USER REQUEST
  return <>{children}</>

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLockedDueToInactivity, setIsLockedDueToInactivity] = useState(false)

  // Check initial session
  useEffect(() => {
    setIsAuthenticated(isSessionActive())
  }, [])

  const lockApp = useCallback(() => {
    clearSession()
    setIsAuthenticated(false)
    setIsLockedDueToInactivity(true)
  }, [])

  // Auto-lock timer logic
  useEffect(() => {
    if (!isAuthenticated) return

    let timeoutId: NodeJS.Timeout
    let durationMs = 5 * 60 * 1000 // Default 5 minutes

    const setupTimer = async () => {
      try {
        const setting = await db.settings.get({ key: 'auto_lock_duration' })
        if (setting) {
          const mins = parseInt(setting.value)
          if (mins === 0) return // 0 could mean off, but requirement says 1,5,10,15,30. We'll handle '0' as disabled just in case.
          durationMs = mins * 60 * 1000
        }
      } catch (e) {
        console.error('Failed to get auto-lock setting', e)
      }

      const resetTimer = () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(lockApp, durationMs)
      }

      // Initial timer
      resetTimer()

      // Event listeners
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
      const handleActivity = () => resetTimer()
      
      events.forEach(event => {
        window.addEventListener(event, handleActivity, { passive: true })
      })

      return () => {
        clearTimeout(timeoutId)
        events.forEach(event => {
          window.removeEventListener(event, handleActivity)
        })
      }
    }

    const cleanupPromise = setupTimer()
    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup())
    }
  }, [isAuthenticated, lockApp])

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        isLockedDueToInactivity={isLockedDueToInactivity}
        onSuccess={() => {
          setIsAuthenticated(true)
          setIsLockedDueToInactivity(false)
        }} 
      />
    )
  }

  return <>{children}</>
}

