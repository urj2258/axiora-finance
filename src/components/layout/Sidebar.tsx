'use client'

import Link from 'next/link'
import { LayoutDashboard, Settings, FileText, Briefcase } from 'lucide-react'
import { db } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'

export function Sidebar() {
  const agencies = useLiveQuery(() => db.agencies.toArray())

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Axiora</h1>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Money Tracker</p>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
          <LayoutDashboard className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Dashboard</span>
        </Link>
        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Agencies</p>
        </div>
        {agencies?.map((agency) => (
          <Link key={agency.id} href={`/dashboard/agency/${agency.id}`} className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
            <Briefcase className="w-5 h-5 text-gray-500" />
            <span className="font-medium">{agency.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <Link href="/dashboard/report" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
          <FileText className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Report</span>
        </Link>
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors mt-2">
          <Settings className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </div>
  )
}
