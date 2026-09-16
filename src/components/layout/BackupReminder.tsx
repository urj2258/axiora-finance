'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { AlertTriangle, X } from 'lucide-react'
import Link from 'next/link'

export function BackupReminder() {
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkBackupStatus() {
      try {
        const lastBackupSetting = await db.settings.where('key').equals('lastBackupDate').first()
        
        if (!lastBackupSetting) {
          // Never backed up
          setIsVisible(true)
        } else {
          const lastBackupDate = new Date(lastBackupSetting.value)
          const now = new Date()
          const diffTime = Math.abs(now.getTime() - lastBackupDate.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays >= 7) {
            setIsVisible(true)
          }
        }
      } catch (error) {
        console.error('Failed to check backup status:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkBackupStatus()
  }, [])

  if (loading || !isVisible) {
    return null
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Data Safety Reminder:</strong> You haven't backed up your data recently. Since data is stored locally, we recommend exporting it to prevent accidental loss.
          </p>
        </div>
        <div className="flex items-center ml-4">
          <Link 
            href="/dashboard/settings" 
            className="text-sm font-medium text-amber-900 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-md transition-colors mr-3 whitespace-nowrap"
          >
            Go to Settings
          </Link>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-amber-500 hover:text-amber-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
