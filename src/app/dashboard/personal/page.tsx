'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Plus, X } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function PersonalExpensesPage() {
  const expenses = useLiveQuery(() => db.personal_expenses.reverse().sortBy('expense_date'))
  const loans = useLiveQuery(() => db.loans.toArray())
  const loanPayments = useLiveQuery(() => db.loan_payments.toArray())

  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showGiveLoan, setShowGiveLoan] = useState(false)
  const [showLoanRepayment, setShowLoanRepayment] = useState<{ id: string, name: string, remaining: number } | null>(null)

  if (!expenses || !loans || !loanPayments) return null

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  let totalLoansGiven = 0
  let totalLoansReturned = 0
  
  loans.forEach(loan => {
    totalLoansGiven += loan.amount_given
    const returned = loanPayments
      .filter(lp => lp.loan_id === loan.id)
      .reduce((sum, curr) => sum + curr.amount_returned, 0)
    totalLoansReturned += returned
  })

  const totalLoansOutstanding = totalLoansGiven - totalLoansReturned

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 relative z-0">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Personal & Loans</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PERSONAL EXPENSES SECTION */}
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Personal Expenses</p>
              <p className="text-2xl font-bold text-gray-900">Rs. {totalExpenses.toLocaleString()}</p>
            </div>
            <button 
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 relative z-10"
            >
              <Plus size={20} />
              Add Expense
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Recent Expenses</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {expenses.map(expense => (
                <div key={expense.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{expense.category}</p>
                    <div className="flex gap-2 text-sm text-gray-500">
                      <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                      {expense.description && (
                        <>
                          <span>&bull;</span>
                          <span>{expense.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">Rs. {expense.amount.toLocaleString()}</p>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No personal expenses recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LOANS SECTION */}
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div>
              <p className="text-sm text-gray-500 font-medium">Loans Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">Rs. {totalLoansOutstanding.toLocaleString()}</p>
            </div>
            <button 
              onClick={() => setShowGiveLoan(true)}
              className="flex items-center gap-2 bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 relative z-10"
            >
              <Plus size={20} />
              Give Loan
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Money Given (Loans)</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {loans.map(loan => {
                const returned = loanPayments
                  .filter(lp => lp.loan_id === loan.id)
                  .reduce((sum, curr) => sum + curr.amount_returned, 0)
                const remaining = loan.amount_given - returned

                return (
                  <div key={loan.id} className="p-4 space-y-2 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900">{loan.person_name}</p>
                        <p className="text-sm text-gray-500">{new Date(loan.date_given).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">Given: Rs. {loan.amount_given.toLocaleString()}</p>
                        <p className="text-sm text-orange-600 font-medium">Remaining: Rs. {remaining.toLocaleString()}</p>
                      </div>
                    </div>
                    {loan.notes && <p className="text-sm text-gray-600 italic">{loan.notes}</p>}
                    <div className="pt-2 flex justify-between items-center">
                       <span className="text-xs text-gray-400">Returned so far: Rs. {returned.toLocaleString()}</span>
                       <button 
                         onClick={() => setShowLoanRepayment({ id: loan.id, name: loan.person_name, remaining })}
                         className="text-sm text-blue-600 font-medium hover:text-blue-700 relative z-10"
                       >
                         + Record Return
                       </button>
                    </div>
                  </div>
                )
              })}
              {loans.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No loans given.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddExpense && <AddExpenseModal onClose={() => setShowAddExpense(false)} />}
      {showGiveLoan && <GiveLoanModal onClose={() => setShowGiveLoan(false)} />}
      {showLoanRepayment && (
        <LoanRepaymentModal 
          loanId={showLoanRepayment.id} 
          personName={showLoanRepayment.name}
          remaining={showLoanRepayment.remaining}
          onClose={() => setShowLoanRepayment(null)} 
        />
      )}
    </div>
  )
}

function AddExpenseModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState('Food')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const handleSave = async () => {
    const eAmount = Number(amount)
    if (!eAmount || eAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    try {
      await db.personal_expenses.add({
        id: uuidv4(),
        amount: eAmount,
        category,
        description: note,
        expense_date: date,
        method: 'cash',
        created_at: new Date().toISOString()
      })
      onClose()
    } catch (err) {
      setError('Failed to save expense')
    }
  }

  const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Family', 'Education', 'Entertainment', 'Other']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Add Personal Expense</h2>
        {error && <div className="mb-4 text-red-600 bg-red-50 p-2 text-sm rounded">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2 rounded bg-white">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
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

function GiveLoanModal({ onClose }: { onClose: () => void }) {
  const [personName, setPersonName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!personName) {
      setError('Person name is required')
      return
    }
    const lAmount = Number(amount)
    if (!lAmount || lAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    try {
      await db.loans.add({
        id: uuidv4(),
        person_name: personName,
        amount_given: lAmount,
        date_given: date,
        expected_return_date: null,
        notes: note,
        status: 'active',
        created_at: new Date().toISOString()
      })
      onClose()
    } catch (err) {
      setError('Failed to save loan')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Give Loan</h2>
        {error && <div className="mb-4 text-red-600 bg-red-50 p-2 text-sm rounded">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Person Name *</label>
            <input type="text" value={personName} onChange={e => setPersonName(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount *</label>
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

function LoanRepaymentModal({ loanId, personName, remaining, onClose }: { loanId: string, personName: string, remaining: number, onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const handleSave = async () => {
    const rAmount = Number(amount)
    if (!rAmount || rAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }
    if (rAmount > remaining) {
      setError('Repayment cannot exceed remaining loan amount')
      return
    }

    try {
      await db.loan_payments.add({
        id: uuidv4(),
        loan_id: loanId,
        amount_returned: rAmount,
        payment_date: date,
        notes: note,
        created_at: new Date().toISOString()
      })
      
      if (rAmount === remaining) {
        await db.loans.update(loanId, { status: 'fully_paid' })
      } else {
        await db.loans.update(loanId, { status: 'partially_paid' })
      }

      onClose()
    } catch (err) {
      setError('Failed to save repayment')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Record Return from {personName}</h2>
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
