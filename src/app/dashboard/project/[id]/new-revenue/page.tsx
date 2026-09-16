'use client'

import { db } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

export default function NewRevenuePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const projectId = params?.id

  const project = useLiveQuery(() => db.projects.get(projectId || ''))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    await db.transactions.add({
      id: uuidv4(),
      project_id: projectId!,
      type: 'revenue',
      amount: Number(formData.get('amount')),
      category: null,
      description: formData.get('description') as string,
      transaction_date: formData.get('transaction_date') as string,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
    if (project) {
      router.push(`/dashboard/client/${project.client_id}`)
    }
  }

  if (!project) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/client/${project.client_id}`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Project List
        </Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Record New Revenue</h1>
          <p className="text-gray-500 mt-1">Project: {project.name}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs.)</label>
            <input 
              type="number" 
              id="amount" 
              name="amount" 
              required 
              min="0"
              step="any"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              placeholder="e.g. 50000"
            />
          </div>

          <div>
            <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              id="transaction_date" 
              name="transaction_date" 
              required 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Note / Description (Optional)</label>
            <input 
              type="text"
              id="description" 
              name="description" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              placeholder="e.g. 50% Upfront Deposit"
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Record Revenue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
