'use client'

import { db } from '@/lib/db'
import { Download, Upload, AlertCircle } from 'lucide-react'
import { useRef, useState } from 'react'

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<string | null>(null)

  const handleExport = async () => {
    try {
      const agencies = await db.agencies.toArray()
      const clients = await db.clients.toArray()
      const projects = await db.projects.toArray()
      const transactions = await db.transactions.toArray()
      const settings = await db.settings.toArray()

      const data = {
        version: 1,
        timestamp: new Date().toISOString(),
        agencies,
        clients,
        projects,
        transactions,
        settings
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `axiora-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Record backup date in settings
      await db.settings.put({
        id: 'lastBackupDate',
        key: 'lastBackupDate',
        value: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data.')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportStatus('Reading file...')

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        setImportStatus('Importing data...')
        const data = JSON.parse(event.target?.result as string)
        
        if (!data.agencies || !data.clients || !data.projects || !data.transactions) {
          throw new Error('Invalid backup file format.')
        }

        const settingsData = data.settings || []

        await db.transaction('rw', db.agencies, db.clients, db.projects, db.transactions, db.settings, async () => {
          // Clear existing
          await db.agencies.clear()
          await db.clients.clear()
          await db.projects.clear()
          await db.transactions.clear()
          await db.settings.clear()

          // Import new
          await db.agencies.bulkAdd(data.agencies)
          await db.clients.bulkAdd(data.clients)
          await db.projects.bulkAdd(data.projects)
          await db.transactions.bulkAdd(data.transactions)
          if (settingsData.length > 0) {
            await db.settings.bulkAdd(settingsData)
          }
        })

        setImportStatus('Import successful! Refreshing...')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (error) {
        console.error('Import failed:', error)
        setImportStatus('Import failed. Make sure the file is a valid backup.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Data Management</h2>
        <p className="text-gray-500 mb-8 text-sm">
          Since your financial data is stored locally on this device, it is highly recommended to regularly export backups.
        </p>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50">
            <div>
              <h3 className="font-medium text-gray-900">Export Backup</h3>
              <p className="text-sm text-gray-500 mt-1">Download all your data as a JSON file.</p>
            </div>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Download className="w-4 h-4" /> Export Data
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50">
            <div>
              <h3 className="font-medium text-gray-900">Import Backup</h3>
              <p className="text-sm text-gray-500 mt-1">Restore your data from a JSON file.</p>
              
              <div className="flex items-start gap-2 mt-2 text-amber-600 bg-amber-50 p-2 rounded text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Warning: Importing will completely replace your current local data.</p>
              </div>
            </div>
            
            <div>
              <input 
                type="file" 
                accept=".json"
                ref={fileInputRef}
                onChange={handleImport}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" /> Import Data
              </button>
            </div>
          </div>
          
          {importStatus && (
            <div className="p-3 text-sm font-medium text-center bg-gray-100 rounded-lg text-gray-700">
              {importStatus}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
