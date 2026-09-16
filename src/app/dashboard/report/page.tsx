'use client'

import { db } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { Printer, ArrowLeft, Download, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, calculateSummary } from '@/utils/format'
import { FinancialReportPDF } from '@/components/pdf/FinancialReportPDF'
import { pdf } from '@react-pdf/renderer'
import { useState } from 'react'

export default function ReportPage() {
  const agencies = useLiveQuery(() => db.agencies.toArray())
  const clients = useLiveQuery(() => db.clients.toArray())
  const projects = useLiveQuery(() => db.projects.toArray())
  const transactions = useLiveQuery(() => db.transactions.toArray())
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSavePDF = async () => {
    if (!agencies || !clients || !projects || !transactions) return
    setIsGenerating(true)
    
    try {
      const blob = await pdf(
        <FinancialReportPDF 
          agencies={agencies} 
          clients={clients} 
          projects={projects} 
          transactions={transactions} 
        />
      ).toBlob()
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const today = new Date()
      const dd = String(today.getDate()).padStart(2, '0')
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const yyyy = today.getFullYear()
      a.download = `Axiora-Financial-Report-${dd}-${mm}-${yyyy}.pdf`
      
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Failed to generate PDF.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!agencies || !clients || !projects || !transactions) {
    return <div className="p-8">Loading Report Data...</div>
  }

  const grandTotal = calculateSummary(transactions)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Non-printable header */}
      <div className="mb-8 flex justify-between items-center">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <button 
          onClick={handleSavePDF}
          disabled={isGenerating}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isGenerating ? 'Generating PDF...' : 'Save PDF'}
        </button>
      </div>

      {/* Screen Preview Report Content */}
      <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 mb-12">
        
        {/* Report Header */}
        <div className="text-center mb-12 border-b pb-8">
          <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest mb-2">Axiora Financial Report</h1>
          <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Grand Total */}
        <div className="bg-gray-50 p-6 rounded-lg mb-12 flex justify-between items-center border border-gray-200">
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Net Income</h2>
            <div className="text-4xl font-bold text-gray-900">{formatCurrency(grandTotal.remaining)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Total Revenue: <span className="font-semibold text-green-700">{formatCurrency(grandTotal.revenue)}</span></div>
            <div className="text-sm text-gray-600">Total Expenses: <span className="font-semibold text-red-700">{formatCurrency(grandTotal.expenses)}</span></div>
          </div>
        </div>

        {/* Agency Breakdown */}
        <div className="space-y-12">
          {agencies.map(agency => {
            const agencyClients = clients.filter(c => c.agency_id === agency.id)
            const agencyClientIds = agencyClients.map(c => c.id)
            const agencyProjects = projects.filter(p => agencyClientIds.includes(p.client_id))
            const agencyProjectIds = agencyProjects.map(p => p.id)
            const agencyTxs = transactions.filter(t => agencyProjectIds.includes(t.project_id))
            const agencySummary = calculateSummary(agencyTxs)

            return (
              <div key={agency.id} className="break-inside-avoid">
                <div className="border-b-2 border-gray-900 pb-2 mb-6 flex justify-between items-end">
                  <h3 className="text-2xl font-bold text-gray-900">{agency.name} Division</h3>
                  <div className="text-right">
                    <span className="font-bold text-lg">{formatCurrency(agencySummary.remaining)}</span>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Net Income</p>
                  </div>
                </div>

                {agencyClients.map(client => {
                  const clientProjects = agencyProjects.filter(p => p.client_id === client.id)
                  const clientProjectIds = clientProjects.map(p => p.id)
                  const clientTxs = transactions.filter(t => clientProjectIds.includes(t.project_id))
                  
                  if (clientTxs.length === 0) return null // Skip empty clients in report

                  return (
                    <div key={client.id} className="mb-6 ml-4">
                      <h4 className="text-lg font-bold text-gray-800 mb-3">{client.name}</h4>
                      
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-y border-gray-200">
                          <tr>
                            <th className="py-2 px-3 font-semibold text-gray-600">Project</th>
                            <th className="py-2 px-3 font-semibold text-gray-600 text-right">Revenue</th>
                            <th className="py-2 px-3 font-semibold text-gray-600 text-right">Expenses</th>
                            <th className="py-2 px-3 font-semibold text-gray-600 text-right">Profit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientProjects.map(project => {
                            const projectTxs = transactions.filter(t => t.project_id === project.id)
                            if (projectTxs.length === 0) return null
                            const pSummary = calculateSummary(projectTxs)

                            return (
                              <tr key={project.id} className="border-b border-gray-100">
                                <td className="py-2 px-3 text-gray-800 font-medium">{project.name}</td>
                                <td className="py-2 px-3 text-right text-green-700">{formatCurrency(pSummary.revenue)}</td>
                                <td className="py-2 px-3 text-right text-red-700">{formatCurrency(pSummary.expenses)}</td>
                                <td className="py-2 px-3 text-right font-bold text-gray-900">{formatCurrency(pSummary.remaining)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
