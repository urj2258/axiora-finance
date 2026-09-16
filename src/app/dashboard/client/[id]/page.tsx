'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { formatCurrency, calculateSummary } from '@/utils/format'
import Link from 'next/link'
import { Plus, ArrowLeft } from 'lucide-react'
import { notFound, useParams } from 'next/navigation'

export default function ClientPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  
  const client = useLiveQuery(() => db.clients.get(id || ''))
  const projects = useLiveQuery(() => db.projects.where('client_id').equals(id || '').toArray())
  const projectIds = projects?.map(p => p.id) || []
  const allTransactions = useLiveQuery(
    () => db.transactions.where('project_id').anyOf(projectIds).toArray(),
    [projectIds]
  )

  if (!client) return <div className="p-8">Loading...</div>

  const clientSummary = calculateSummary(allTransactions || [])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/agency/${client.agency_id}`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Agency
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{client.name}</h1>
          {client.notes && <p className="text-gray-500 mt-2 max-w-2xl">{client.notes}</p>}
        </div>
        <Link 
          href={`/dashboard/client/${id}/new-project`}
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Project
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex gap-8">
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(clientSummary.revenue)}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(clientSummary.expenses)}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Remaining Balance</div>
          <div className={`text-2xl font-bold ${clientSummary.remaining >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            {formatCurrency(clientSummary.remaining)}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Projects</h2>
        
        {projects?.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500 mb-4">No projects found for this client.</p>
            <Link href={`/dashboard/client/${id}/new-project`} className="text-sm font-medium text-gray-900 hover:underline">
              Create the first project &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {projects?.map(project => {
              const projectTxs = (allTransactions || []).filter(t => t.project_id === project.id)
              const summary = calculateSummary(projectTxs)
              const revenueTxs = projectTxs.filter(t => t.type === 'revenue')
              const expenseTxs = projectTxs.filter(t => t.type === 'expense')

              return (
                <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 relative">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 pr-16">{project.name}</h3>
                      <div className="flex gap-6 mt-2 text-sm">
                        <span className="font-medium text-gray-600">Revenue: {formatCurrency(summary.revenue)}</span>
                        <span className="font-medium text-red-600">Expenses: {formatCurrency(summary.expenses)}</span>
                        <span className={`font-bold ${summary.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Remaining: {formatCurrency(summary.remaining)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/client/${id}/edit-project/${project.id}`} className="text-xs text-gray-400 hover:text-gray-900 font-medium">Edit</Link>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/project/${project.id}/new-revenue`} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded hover:bg-green-100 transition-colors">
                          + Revenue
                        </Link>
                        <Link href={`/dashboard/project/${project.id}/new-expense`} className="px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded hover:bg-red-100 transition-colors">
                          + Expense
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Revenue History</h4>
                        <ul className="space-y-3">
                          {revenueTxs.map(tx => (
                            <li key={tx.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-gray-900">{tx.description || 'Revenue'} <Link href={`/dashboard/project/${project.id}/edit-transaction/${tx.id}`} className="text-xs text-gray-400 hover:text-gray-900 ml-2">Edit</Link></p>
                                <p className="text-xs text-gray-500">{new Date(tx.transaction_date).toLocaleDateString()}</p>
                              </div>
                              <span className="font-semibold text-green-600">{formatCurrency(tx.amount)}</span>
                            </li>
                          ))}
                          {revenueTxs.length === 0 && <p className="text-sm text-gray-500 italic">No revenue recorded.</p>}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Expenses</h4>
                        <ul className="space-y-3">
                          {expenseTxs.map(tx => (
                            <li key={tx.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-gray-900">{tx.category || 'Expense'} <span className="font-normal text-gray-500 ml-1">{tx.description && `- ${tx.description}`}</span> <Link href={`/dashboard/project/${project.id}/edit-transaction/${tx.id}`} className="text-xs text-gray-400 hover:text-gray-900 ml-2">Edit</Link></p>
                                <p className="text-xs text-gray-500">{new Date(tx.transaction_date).toLocaleDateString()}</p>
                              </div>
                              <span className="font-semibold text-red-600">{formatCurrency(tx.amount)}</span>
                            </li>
                          ))}
                          {expenseTxs.length === 0 && <p className="text-sm text-gray-500 italic">No expenses recorded.</p>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
