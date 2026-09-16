'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { calculateSummary } from '@/utils/format'
import { SummaryCard } from '@/components/ui/SummaryCard'
import Link from 'next/link'
import { ArrowRight, LayoutDashboard } from 'lucide-react'
import { FinancialSummary } from '@/types'

export default function DashboardPage() {
  const agencies = useLiveQuery(() => db.agencies.toArray())
  const allTransactions = useLiveQuery(() => db.transactions.toArray())
  
  if (!agencies || !allTransactions) return <div className="p-8">Loading...</div>

  const totalSummary = calculateSummary(allTransactions)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Overview</h1>
          <p className="text-gray-500 mt-1">Track your agencies, projects, and cash flow.</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <LayoutDashboard className="w-48 h-48" />
        </div>
        <h2 className="text-gray-400 font-medium tracking-wide uppercase text-sm mb-4">Total Combined Balance</h2>
        <div className="text-5xl font-bold tracking-tight mb-8">
          Rs. {totalSummary.remaining.toLocaleString()}
        </div>
        <div className="flex gap-8">
          <div>
            <div className="text-sm text-gray-400 mb-1">Total Revenue</div>
            <div className="text-xl font-semibold text-green-400">Rs. {totalSummary.revenue.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Total Expenses</div>
            <div className="text-xl font-semibold text-red-400">Rs. {totalSummary.expenses.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agencies.map(agency => {
          // Calculate agency summary by finding clients -> projects -> transactions
          // We can do this efficiently inside the component since we have Dexie
          return <AgencyCard key={agency.id} agency={agency} />
        })}
      </div>
    </div>
  )
}

function AgencyCard({ agency }: { agency: any }) {
  const clients = useLiveQuery(() => db.clients.where('agency_id').equals(agency.id).toArray())
  const clientIds = clients?.map(c => c.id) || []
  
  const projects = useLiveQuery(
    () => db.projects.where('client_id').anyOf(clientIds).toArray(),
    [clientIds]
  )
  const projectIds = projects?.map(p => p.id) || []
  
  const transactions = useLiveQuery(
    () => db.transactions.where('project_id').anyOf(projectIds).toArray(),
    [projectIds]
  )

  const summary = calculateSummary(transactions || [])

  return (
    <SummaryCard
      title={agency.name}
      summary={summary}
      actionLabel="View Agency"
      actionHref={`/dashboard/agency/${agency.id}`}
    />
  )
}
