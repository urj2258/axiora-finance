'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Plus, ChevronDown, ChevronRight, CheckCircle, X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function MarketingPage() {
  const allAgencies = useLiveQuery(() => db.agencies.toArray())
  const agency = allAgencies?.find(a => a.name.toLowerCase().includes('marketing')) || allAgencies?.[0]
  
  const clients = useLiveQuery(
    () => db.clients.toArray(),
    []
  )

  const payments = useLiveQuery(() => db.marketing_payments.toArray())

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` // YYYY-MM
  })

  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false)

  if (!clients || !payments) return null

  // Filter clients for the current agency, or show all if agency logic is messy
  const agencyClients = agency ? clients.filter(c => c.agency_id === agency.id) : clients.filter(c => c.agency_id === 'default')


  // Calculate Monthly Totals
  const activeClients = agencyClients.filter(c => c.is_active !== false)
  const monthlyExpected = activeClients.reduce((sum, c) => sum + (c.monthly_amount || 0), 0)
  
  const monthPayments = payments.filter(p => p.month_year === selectedMonth)
  const monthlyReceived = monthPayments.reduce((sum, p) => sum + p.amount, 0)
  
  const monthlyRemaining = monthlyExpected - monthlyReceived

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 relative z-0">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Marketing</h1>
        <button 
          onClick={() => setIsNewClientModalOpen(true)}
          className="flex items-center gap-1 md:gap-2 bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 relative z-10 text-sm md:text-base"
        >
          <Plus size={20} className="w-4 h-4 md:w-5 md:h-5" />
          New Client
        </button>
      </div>

      {/* MONTH SELECTOR & TOTALS */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="text-base md:text-lg font-bold text-gray-900">Monthly Overview</h2>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-gray-50 p-3 md:p-4 rounded-lg col-span-2 md:col-span-1">
            <p className="text-xs md:text-sm text-gray-500 font-medium">Expected ({selectedMonth})</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">Rs. {monthlyExpected.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-3 md:p-4 rounded-lg">
            <p className="text-xs md:text-sm text-green-600 font-medium">Received</p>
            <p className="text-lg md:text-2xl font-bold text-green-700 truncate">Rs. {monthlyReceived.toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 p-3 md:p-4 rounded-lg">
            <p className="text-xs md:text-sm text-orange-600 font-medium">Remaining</p>
            <p className="text-lg md:text-2xl font-bold text-orange-700 truncate">Rs. {monthlyRemaining.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* CLIENTS LIST */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Active Clients</h2>
        <div className="grid grid-cols-1 gap-4">
          {activeClients.map(client => (
            <ClientCard 
              key={client.id} 
              client={client} 
              month={selectedMonth}
              payments={monthPayments.filter(p => p.client_id === client.id)}
            />
          ))}
          {activeClients.length === 0 && (
            <div className="text-center p-8 bg-gray-50 rounded-xl text-gray-500 border border-gray-100 text-sm md:text-base">
              No active marketing clients found.
            </div>
          )}
        </div>
      </div>

      {isNewClientModalOpen && (
        <NewClientModal 
          agencyId={agency?.id || 'default'} 
          onClose={() => setIsNewClientModalOpen(false)} 
        />
      )}
    </div>
  )
}

function NewClientModal({ agencyId, onClose }: { agencyId: string, onClose: () => void }) {
  const [clientName, setClientName] = useState('')
  const [profession, setProfession] = useState('')
  const [monthlyAmount, setMonthlyAmount] = useState('')
  const [installments, setInstallments] = useState(1) // 1 or 2
  const [error, setError] = useState('')

  const handleSave = async () => {
    try {
      if (!clientName || !monthlyAmount) {
        setError('Please fill all required fields')
        return
      }

      const mAmount = Number(monthlyAmount)
      if (mAmount <= 0) {
        setError('Monthly amount must be greater than 0')
        return
      }

      await db.clients.add({
        id: uuidv4(),
        agency_id: agencyId,
        name: clientName,
        profession: profession,
        monthly_amount: mAmount,
        payment_schedule: installments,
        is_active: true,
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      
      onClose()
    } catch (err) {
      setError('Failed to save client')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">New Marketing Client</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded"><X size={20} /></button>
        </div>
        
        {error && <div className="mb-4 text-red-600 bg-red-50 p-2 text-sm rounded">{error}</div>}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client Name *</label>
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Profession / Business</label>
            <input type="text" value={profession} onChange={e => setProfession(e.target.value)} className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Monthly Amount *</label>
            <input type="number" value={monthlyAmount} onChange={e => setMonthlyAmount(e.target.value)} className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Schedule</label>
            <select value={installments} onChange={e => setInstallments(Number(e.target.value))} className="w-full border p-2 rounded-lg bg-white">
              <option value={1}>One Installment</option>
              <option value={2}>Two Installments</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm md:text-base">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base">Save</button>
        </div>
      </div>
    </div>
  )
}

function ClientCard({ client, month, payments }: any) {
  const [expanded, setExpanded] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const received = payments.reduce((sum: number, curr: any) => sum + curr.amount, 0)
  const expected = client.monthly_amount || 0
  const remaining = expected - received
  const isPaid = remaining <= 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div 
        className="p-3 md:p-4 cursor-pointer hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start sm:items-center gap-3 md:gap-4">
          {expanded ? <ChevronDown className="text-gray-400 mt-1 sm:mt-0 flex-shrink-0" /> : <ChevronRight className="text-gray-400 mt-1 sm:mt-0 flex-shrink-0" />}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 break-words">{client.name}</h3>
              <p className="text-xs md:text-sm text-gray-500">{client.profession || 'Business'}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowEditModal(true) }}
                className="flex items-center justify-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded-lg text-xs font-medium transition-colors h-7"
                title="Edit Client"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                Edit
              </button>
              <button 
                onClick={async (e) => { 
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete ${client.name}?`)) {
                    await db.clients.delete(client.id)
                  }
                }}
                className="flex items-center justify-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg text-xs font-medium transition-colors h-7"
                title="Delete Client"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                Delete
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 ml-7 sm:ml-0">
          <div className="text-left sm:text-right">
            <span className="text-xs md:text-sm text-gray-500 sm:block inline mr-2 sm:mr-0">Monthly</span>
            <span className="font-bold text-gray-900 text-sm md:text-base">Rs. {expected.toLocaleString()}</span>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs md:text-sm text-gray-500 sm:block hidden">Status</span>
            {isPaid ? (
              <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs md:text-sm">
                <CheckCircle size={16} /> Paid
              </span>
            ) : (
              <span className="text-orange-600 font-medium text-xs md:text-sm">Remaining: Rs. {remaining.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-3 md:p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-900 text-sm md:text-base">Payments ({month})</h4>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowPaymentModal(true) }}
              className="text-sm text-blue-600 font-medium hover:text-blue-800"
            >
              + Add Payment
            </button>
          </div>
          
          <div className="space-y-2">
            {payments.map((p: any) => (
              <div key={p.id} className="bg-white p-3 rounded-lg border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs md:text-sm gap-1">
                <div>
                  <span className="font-medium text-gray-900">Rs. {p.amount.toLocaleString()}</span>
                  <span className="text-gray-500 ml-2 hidden sm:inline">{new Date(p.payment_date).toLocaleDateString()}</span>
                </div>
                {p.notes && <span className="text-gray-500 italic truncate sm:text-right">{p.notes}</span>}
                <span className="text-gray-500 sm:hidden block">{new Date(p.payment_date).toLocaleDateString()}</span>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-xs md:text-sm text-gray-500 text-center py-4 bg-white rounded-lg border border-dashed border-gray-200">
                No payments recorded for this month yet.
              </p>
            )}
          </div>
        </div>
      )}

      {showPaymentModal && (
        <AddPaymentModal 
          clientId={client.id}
          month={month}
          remaining={remaining}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {showEditModal && (
        <EditClientModal 
          client={client}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}

function EditClientModal({ client, onClose }: { client: any, onClose: () => void }) {
  const [clientName, setClientName] = useState(client.name || '')
  const [profession, setProfession] = useState(client.profession || '')
  const [monthlyAmount, setMonthlyAmount] = useState(client.monthly_amount?.toString() || '')
  const [error, setError] = useState('')

  const handleSave = async () => {
    try {
      if (!clientName || !monthlyAmount) {
        setError('Please fill all required fields')
        return
      }

      const mAmount = Number(monthlyAmount)
      if (mAmount <= 0) {
        setError('Monthly amount must be greater than 0')
        return
      }

      await db.clients.update(client.id, {
        name: clientName,
        profession: profession,
        monthly_amount: mAmount,
        updated_at: new Date().toISOString()
      })
      
      onClose()
    } catch (err) {
      setError('Failed to update client')
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      try {
        await db.clients.delete(client.id)
        onClose()
      } catch (err) {
        setError('Failed to delete client')
        console.error(err)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Client</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded"><X size={20} /></button>
        </div>
        
        {error && <div className="mb-4 text-red-600 bg-red-50 p-2 text-sm rounded">{error}</div>}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client Name *</label>
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Profession / Business</label>
            <input type="text" value={profession} onChange={e => setProfession(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Monthly Amount *</label>
            <input type="number" value={monthlyAmount} onChange={e => setMonthlyAmount(e.target.value)} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button onClick={handleDelete} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors" title="Delete Client">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddPaymentModal({ clientId, month, remaining, onClose }: { clientId: string, month: string, remaining: number, onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const handleSave = async () => {
    const pAmount = Number(amount)
    if (!pAmount || pAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    try {
      await db.marketing_payments.add({
        id: uuidv4(),
        client_id: clientId,
        amount: pAmount,
        payment_date: date,
        month_year: month,
        notes: note,
        created_at: new Date().toISOString()
      })
      onClose()
    } catch (err) {
      setError('Failed to save payment')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Add Payment ({month})</h2>
        {error && <div className="mb-4 text-red-600 bg-red-50 p-2 text-sm rounded">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (Remaining: Rs. {remaining.toLocaleString()})</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full border p-2 rounded" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  )
}
