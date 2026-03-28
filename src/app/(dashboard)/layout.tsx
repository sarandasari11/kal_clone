import { 
  Calendar, 
  Clock, 
  Layers, 
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { Toaster } from '@/components/ui/sonner'

const navItems = [
  { name: 'Event Types', href: '/event-types', icon: Layers },
  { name: 'Availability', href: '/availability', icon: Clock },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-gray-200 bg-white shadow-sm lg:block z-40">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <Link href="/event-types" className="flex items-center gap-2 font-semibold">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-md">
                <Calendar size={18} />
              </div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">CalClone</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100"
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
                <User size={20} className="text-white" />
              </div>
              <div className="flex-1 overflow-hidden min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">Admin User</p>
                <p className="truncate text-xs text-gray-500">admin@example.com</p>
              </div>
            </div>
            <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  )
}
