'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { formatCurrency, calculateSummary } from '@/utils/format'
import Link from 'next/link'
import { Plus, ArrowLeft, TrendingUp, TrendingDown, Wallet, Pencil, PlusCircle } from 'lucide-react'
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
                <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50/50 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{project.name}</h3>
                        <Link 
                          href={`/dashboard/client/${id}/edit-project/${project.id}`} 
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded-md"
                          title="Edit Project"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5 bg-green-50/50 px-3 py-1.5 rounded-lg border border-green-100">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-gray-500">Rev:</span>
                          <span className="font-bold text-green-700">{formatCurrency(summary.revenue)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-red-50/50 px-3 py-1.5 rounded-lg border border-red-100">
                          <TrendingDown className="w-4 h-4 text-red-400" />
                          <span className="font-medium text-gray-500">Exp:</span>
                          <span className="font-bold text-red-600">{formatCurrency(summary.expenses)}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${summary.remaining >= 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                          <Wallet className={`w-4 h-4 ${summary.remaining >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                          <span className="font-medium text-gray-500">Bal:</span>
                          <span className={`font-extrabold ${summary.remaining >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {formatCurrency(summary.remaining)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                      <Link 
                        href={`/dashboard/project/${project.id}/new-revenue`} 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                      >
                        <PlusCircle className="w-4 h-4" /> Revenue
                      </Link>
                      <Link 
                        href={`/dashboard/project/${project.id}/new-expense`} 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                      >
                        <PlusCircle className="w-4 h-4" /> Expense
                      </Link>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                      {/* Revenue Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Revenue History</h4>
                          <span className="text-xs font-medium text-gray-400">{revenueTxs.length} items</span>
                        </div>
                        <ul className="space-y-2.5">
                          {revenueTxs.map(tx => (
                            <li key={tx.id} className="group flex justify-between items-center text-sm p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900">{tx.description || 'Revenue'}</span>
                                <span className="text-xs text-gray-400 mt-0.5">{new Date(tx.transaction_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-bold text-green-600">{formatCurrency(tx.amount)}</span>
                                <Link 
                                  href={`/dashboard/project/${project.id}/edit-transaction/${tx.id}`} 
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </li>
                          ))}
                          {revenueTxs.length === 0 && (
                            <div className="text-center py-6 px-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                              <p className="text-sm text-gray-400">No revenue recorded yet.</p>
                            </div>
                          )}
                        </ul>
                      </div>
                      
                      {/* Expenses Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Expenses</h4>
                          <span className="text-xs font-medium text-gray-400">{expenseTxs.length} items</span>
                        </div>
                        <ul className="space-y-2.5">
                          {expenseTxs.map(tx => (
                            <li key={tx.id} className="group flex justify-between items-center text-sm p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900">
                                  {tx.category || 'Expense'}
                                  {tx.description && <span className="font-normal text-gray-500 ml-1.5">• {tx.description}</span>}
                                </span>
                                <span className="text-xs text-gray-400 mt-0.5">{new Date(tx.transaction_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-bold text-red-600">{formatCurrency(tx.amount)}</span>
                                <Link 
                                  href={`/dashboard/project/${project.id}/edit-transaction/${tx.id}`} 
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </li>
                          ))}
                          {expenseTxs.length === 0 && (
                            <div className="text-center py-6 px-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                              <p className="text-sm text-gray-400">No expenses recorded yet.</p>
                            </div>
                          )}
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
