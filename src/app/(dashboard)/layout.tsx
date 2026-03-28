import { 
  Calendar, 
  Clock, 
  Layers, 
  Settings, 
  LogOut,
  User
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
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r bg-white lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b">
            <Link href="/event-types" className="flex items-center gap-2 font-semibold">
              <div className="h-8 w-8 rounded bg-black flex items-center justify-center text-white">
                <Calendar size={18} />
              </div>
              <span className="text-xl tracking-tight">CalClone</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={18} className="text-gray-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">Admin User</p>
                <p className="truncate text-xs text-gray-500">admin@example.com</p>
              </div>
            </div>
            <button className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        <div className="mx-auto max-w-5xl p-8">
          {children}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  )
}
