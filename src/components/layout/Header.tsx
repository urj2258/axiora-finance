import { BadgeCheck } from 'lucide-react'
import { BackupReminder } from './BackupReminder'

export function Header() {
  return (
    <>
      <BackupReminder />
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-end px-8">
        <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
          <BadgeCheck className="w-4 h-4" />
          Offline Ready
        </div>
      </header>
    </>
  )
}
