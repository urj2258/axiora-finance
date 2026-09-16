'use client'

import { db } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound, useRouter, useParams } from 'next/navigation'

export default function EditTransactionPage() {
  const router = useRouter()
  const params = useParams<{ id: string, transactionId: string }>()
  const { id, transactionId } = params!
  
  const transaction = useLiveQuery(() => db.transactions.get(transactionId))
  const project = useLiveQuery(() => db.projects.get(id))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    await db.transactions.update(transactionId, {
      amount: Number(formData.get('amount')),
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      transaction_date: formData.get('transaction_date') as string,
      updated_at: new Date().toISOString()
    })
    
    if (project) {
      router.push(`/dashboard/client/${project.client_id}`)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    
    await db.transactions.delete(transactionId)

    if (project) {
      router.push(`/dashboard/client/${project.client_id}`)
    }
  }

  if (transaction === undefined || project === undefined) return <div className="p-8">Loading...</div>
  if (transaction === null || project === null) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/client/${project.client_id}`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Project List
        </Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
        <div className="absolute top-8 right-8">
            <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm font-medium">
              Delete Transaction
            </button>
        </div>
        <div className="mb-6 border-b pb-4 pr-32">
          <h1 className="text-2xl font-bold text-gray-900">Edit {transaction.type === 'revenue' ? 'Revenue' : 'Expense'}</h1>
          <p className="text-gray-500 mt-1">Project: {project.name}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.)</label>
            <input 
              type="number" 
              id="amount" 
              name="amount" 
              defaultValue={transaction.amount}
              required 
              min="0"
              step="any"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            />
          </div>

          {transaction.type === 'expense' && (
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Expense Category</label>
              <input 
                type="text" 
                id="category" 
                name="category" 
                defaultValue={transaction.category || ''}
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              id="transaction_date" 
              name="transaction_date" 
              defaultValue={transaction.transaction_date}
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Note / Description (Optional)</label>
            <input 
              type="text"
              id="description" 
              name="description" 
              defaultValue={transaction.description || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <Link 
              href={`/dashboard/client/${project.client_id}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              className={`px-6 py-2 text-white rounded-lg text-sm font-medium transition-colors ${transaction.type === 'revenue' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
