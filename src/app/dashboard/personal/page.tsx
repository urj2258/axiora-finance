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
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8 relative z-0">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Personal & Loans</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* PERSONAL EXPENSES SECTION */}
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div>
              <p className="text-xs md:text-sm text-gray-500 font-medium">Total Personal Expenses</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">Rs. {totalExpenses.toLocaleString()}</p>
            </div>
            <button 
              onClick={() => setShowAddExpense(true)}
              className="flex items-center justify-center gap-1 md:gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 relative z-10 text-sm md:text-base w-full sm:w-auto"
            >
              <Plus size={20} className="w-4 h-4 md:w-5 md:h-5" />
              Add Expense
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Recent Expenses</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {expenses.map(expense => (
                <div key={expense.id} className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900 text-sm md:text-base">{expense.category}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs md:text-sm text-gray-500">
                      <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                      {expense.description && (
                        <>
                          <span className="hidden sm:inline">&bull;</span>
                          <span className="w-full sm:w-auto">{expense.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 text-base md:text-lg">Rs. {expense.amount.toLocaleString()}</p>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm md:text-base">
                  No personal expenses recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LOANS SECTION */}
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div>
              <p className="text-xs md:text-sm text-gray-500 font-medium">Loans Outstanding</p>
              <p className="text-xl md:text-2xl font-bold text-orange-600 truncate">Rs. {totalLoansOutstanding.toLocaleString()}</p>
            </div>
            <button 
              onClick={() => setShowGiveLoan(true)}
              className="flex items-center justify-center gap-1 md:gap-2 bg-white text-gray-900 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 relative z-10 text-sm md:text-base w-full sm:w-auto"
            >
              <Plus size={20} className="w-4 h-4 md:w-5 md:h-5" />
              Give Loan
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Money Given (Loans)</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {loans.map(loan => {
                const returned = loanPayments
                  .filter(lp => lp.loan_id === loan.id)
                  .reduce((sum, curr) => sum + curr.amount_returned, 0)
                const remaining = loan.amount_given - returned

                return (
                  <div key={loan.id} className="p-4 space-y-2 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <p className="font-bold text-gray-900 text-sm md:text-base">{loan.person_name}</p>
                        <p className="text-xs md:text-sm text-gray-500">{new Date(loan.date_given).toLocaleDateString()}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-gray-900 text-sm md:text-base truncate">Given: Rs. {loan.amount_given.toLocaleString()}</p>
                        <p className="text-xs md:text-sm text-orange-600 font-medium truncate">Remaining: Rs. {remaining.toLocaleString()}</p>
                      </div>
                    </div>
                    {loan.notes && <p className="text-xs md:text-sm text-gray-600 italic break-words">{loan.notes}</p>}
                    <div className="pt-3 border-t border-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                       <span className="text-xs md:text-sm text-gray-500">Returned so far: Rs. {returned.toLocaleString()}</span>
                       <button 
                         onClick={() => setShowLoanRepayment({ id: loan.id, name: loan.person_name, remaining })}
                         className="text-sm text-blue-600 font-medium hover:text-blue-700 relative z-10 bg-blue-50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto text-center"
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
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add Personal Expense</h2>
        {error && <div className="mb-4 text-red-600 bg-red-50 p-2 text-sm rounded-lg">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2 rounded-lg bg-white">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full border p-2 rounded-lg" />
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
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Give Loan</h2>
        {error && <div className="mb-4 text-red-600 bg-red-50 p-2 text-sm rounded-lg">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Person Name *</label>
            <input type="text" value={personName} onChange={e => setPersonName(e.target.value)} className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount *</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full border p-2 rounded-lg" />
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
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Record Return from {personName}</h2>
        {error && <div className="mb-4 text-red-600 bg-red-50 p-2 text-sm rounded-lg">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (Remaining: Rs. {remaining.toLocaleString()})</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full border p-2 rounded-lg" />
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
