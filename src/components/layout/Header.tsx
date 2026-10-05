import { BadgeCheck, Menu } from 'lucide-react'
import { BackupReminder } from './BackupReminder'

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <>
      <BackupReminder />
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between md:justify-end px-4 md:px-8">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
          <BadgeCheck className="w-4 h-4" />
          Offline Ready
        </div>
      </header>
    </>
  )
}
