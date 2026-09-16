'use client'

import { db } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound, useRouter, useParams } from 'next/navigation'

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams<{ id: string, clientId: string }>()
  const { id, clientId } = params!
  
  const client = useLiveQuery(() => db.clients.get(clientId))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    await db.clients.update(clientId, {
      name: formData.get('name') as string,
      notes: formData.get('notes') as string,
      updated_at: new Date().toISOString()
    })
    
    router.push(`/dashboard/agency/${id}`)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this client? All projects and transactions will be deleted.')) return
    
    // We should also delete all projects and transactions cascading...
    const projects = await db.projects.where('client_id').equals(clientId).toArray()
    const projectIds = projects.map(p => p.id)
    
    await db.transaction('rw', db.clients, db.projects, db.transactions, async () => {
      await db.transactions.where('project_id').anyOf(projectIds).delete()
      await db.projects.where('client_id').equals(clientId).delete()
      await db.clients.delete(clientId)
    })

    router.push(`/dashboard/agency/${id}`)
  }

  if (client === undefined) return <div className="p-8">Loading...</div>
  if (client === null) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/agency/${id}`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Agency
        </Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
        <div className="absolute top-8 right-8">
            <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm font-medium">
              Delete Client
            </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Client</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              defaultValue={client.name}
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea 
              id="notes" 
              name="notes" 
              defaultValue={client.notes || ''}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <Link 
              href={`/dashboard/agency/${id}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
