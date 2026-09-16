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
  const clients = useLiveQuery(() => db.clients.toArray())
  const projects = useLiveQuery(() => db.projects.toArray())
  const allTransactions = useLiveQuery(() => db.transactions.toArray())
  
  if (!agencies || !clients || !projects || !allTransactions) return <div className="p-8">Loading...</div>

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
        {agencies.map(agency => (
          <AgencyCard 
            key={agency.id} 
            agency={agency} 
            clients={clients} 
            projects={projects} 
            transactions={allTransactions} 
          />
        ))}
      </div>
    </div>
  )
}

function AgencyCard({ 
  agency, 
  clients, 
  projects, 
  transactions 
}: { 
  agency: any, 
  clients: any[], 
  projects: any[], 
  transactions: any[] 
}) {
  const agencyClients = clients.filter(c => c.agency_id === agency.id)
  const clientIds = agencyClients.map(c => c.id)
  
  const agencyProjects = projects.filter(p => clientIds.includes(p.client_id))
  const projectIds = agencyProjects.map(p => p.id)
  
  const agencyTxs = transactions.filter(t => projectIds.includes(t.project_id))

  const summary = calculateSummary(agencyTxs)

  return (
    <SummaryCard
      title={agency.name}
      summary={summary}
      actionLabel="View Agency"
      actionHref={`/dashboard/agency/${agency.id}`}
    />
  )
}
