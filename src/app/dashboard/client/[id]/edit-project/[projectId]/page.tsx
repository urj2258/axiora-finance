'use client'

import { db } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound, useRouter, useParams } from 'next/navigation'

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams<{ id: string, projectId: string }>()
  const { id, projectId } = params!
  
  const project = useLiveQuery(() => db.projects.get(projectId))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    await db.projects.update(projectId, {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      updated_at: new Date().toISOString()
    })
    
    router.push(`/dashboard/client/${id}`)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this project? All transactions under it will be deleted.')) return
    
    await db.transaction('rw', db.projects, db.transactions, async () => {
      await db.transactions.where('project_id').equals(projectId).delete()
      await db.projects.delete(projectId)
    })

    router.push(`/dashboard/client/${id}`)
  }

  if (project === undefined) return <div className="p-8">Loading...</div>
  if (project === null) notFound()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/client/${id}`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm font-medium w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Client
        </Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
        <div className="absolute top-8 right-8">
            <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm font-medium">
              Delete Project
            </button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Project</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              defaultValue={project.name}
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea 
              id="description" 
              name="description" 
              defaultValue={project.description || ''}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <Link 
              href={`/dashboard/client/${id}`}
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
