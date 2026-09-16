'use client'

import { Trash2 } from 'lucide-react'

export function DeleteButton({ 
  onDelete, 
  itemType 
}: { 
  onDelete: () => void, 
  itemType: string 
}) {
  return (
    <button 
      onClick={() => {
        if (window.confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`)) {
          onDelete()
        }
      }}
      className="p-2 text-gray-400 hover:text-red-600 rounded transition-colors"
      title={`Delete ${itemType}`}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
