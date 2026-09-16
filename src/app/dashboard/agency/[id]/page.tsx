'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { calculateSummary, formatCurrency } from '@/utils/format'
import { SummaryCard } from '@/components/ui/SummaryCard'
import Link from 'next/link'
import { Plus, ArrowLeft } from 'lucide-react'
import { notFound, useParams } from 'next/navigation'

export default function AgencyPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  
  const agency = useLiveQuery(() => db.agencies.get(id || ''))
  const clients = useLiveQuery(() => db.clients.where('agency_id').equals(id || '').toArray())
  
  if (!agency) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{agency.name} Agency</h1>
          <p className="text-gray-500 mt-1">Manage clients and track revenue for {agency.name}.</p>
        </div>
        <Link 
          href={`/dashboard/agency/${id}/new-client`}
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Client
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Clients</h2>
          
          {clients?.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500 mb-4">No clients added yet.</p>
              <Link href={`/dashboard/agency/${id}/new-client`} className="text-sm font-medium text-gray-900 hover:underline">
                Add your first client &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients?.map(client => (
                <ClientCard key={client.id} client={client} agencyId={id!} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ClientCard({ client, agencyId }: { client: any, agencyId: string }) {
  const projects = useLiveQuery(() => db.projects.where('client_id').equals(client.id).toArray())
  const projectIds = projects?.map(p => p.id) || []
  
  const transactions = useLiveQuery(
    () => db.transactions.where('project_id').anyOf(projectIds).toArray(),
    [projectIds]
  )

  const summary = calculateSummary(transactions || [])

  return (
    <SummaryCard
      title={client.name}
      summary={summary}
      actionLabel="View Client Details"
      actionHref={`/dashboard/client/${client.id}`}
      editHref={`/dashboard/agency/${agencyId}/edit-client/${client.id}`}
    />
  )
}
