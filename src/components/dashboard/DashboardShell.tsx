"use client";

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
import { usePathname } from 'next/navigation'
import { Toaster } from '@/components/ui/sonner'
import { signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import React from 'react'

const navItems = [
  { name: 'Event Types', href: '/event-types', icon: Layers },
  { name: 'Availability', href: '/availability', icon: Clock },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
]

export function DashboardShell({ 
  children, 
  session 
}: { 
  children: React.ReactNode, 
  session: any 
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar - Floating style */}
      <aside className="fixed left-4 top-4 bottom-4 hidden w-64 lg:block z-40">
        <div className="flex h-full flex-col bg-white border border-slate-200/60 rounded-3xl soft-shadow overflow-hidden">
          {/* Logo */}
          <div className="flex h-20 items-center px-8">
            <Link href="/event-types" className="flex items-center gap-3 font-semibold group">
               <motion.div 
                 whileHover={{ scale: 1.05, rotate: 5 }}
                 className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20"
               >
                <Calendar size={20} />
              </motion.div>
              <span className="text-xl font-bold tracking-tight text-slate-900">KalClone</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 px-4 pt-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-primary/5 rounded-2xl border border-primary/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon size={20} className={isActive ? 'text-primary' : 'text-slate-400'} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 mt-auto">
             <div className="outline-box p-4 bg-slate-50/50 border-slate-200/40 shadow-none">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-md">
                    <User size={18} className="text-white" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-xs font-bold text-slate-900 leading-tight">{session?.user?.name || 'User'}</p>
                    <p className="truncate text-[10px] font-medium text-slate-500 uppercase tracking-wider">{session?.user?.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                >
                  <LogOut size={14} />
                  Log out
                </button>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-72">
        <div className="mx-auto w-full max-w-6xl p-6 sm:p-8 lg:p-12">
          {children}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  )
}
