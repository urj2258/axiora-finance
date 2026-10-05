'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Settings, Code2, 
  Smartphone, Wallet
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive(href) || pathname.startsWith(href) && href !== '/dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive(href) || pathname.startsWith(href) && href !== '/dashboard' ? 'text-blue-600' : 'text-gray-500'}`} />
      <span className="font-medium text-sm">{label}</span>
    </Link>
  )

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
      <div className="p-6 sticky top-0 bg-white z-10 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Axiora</h1>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Money Tracker</p>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem href="/dashboard/development" icon={Code2} label="Development" />
        <NavItem href="/dashboard/marketing" icon={Smartphone} label="Marketing" />
        <NavItem href="/dashboard/personal" icon={Wallet} label="Personal Expenses" />
      </nav>

      <div className="p-4 border-t border-gray-200">
        <NavItem href="/dashboard/settings" icon={Settings} label="Settings" />
      </div>
    </div>
  )
}
