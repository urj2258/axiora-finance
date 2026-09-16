'use client'

import { db } from '@/lib/db'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

export default function NewClientPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const agencyId = params?.id

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    await db.clients.add({
      id: uuidv4(),
      agency_id: agencyId!,
      name: formData.get('name') as string,
      notes: formData.get('notes') as string,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
    router.push(`/dashboard/agency/${agencyId}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/agency/${agencyId}`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Agency
        </Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Client</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea 
              id="notes" 
              name="notes" 
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              placeholder="Any specific details about this client..."
            />
          </div>

          <div className="pt-4 flex gap-4">
            <Link 
              href={`/dashboard/agency/${agencyId}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Create Client
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
