"use client";

import { 
  Calendar, 
  Code2,
  Clock, 
  Layers, 
  LogOut,
  Menu,
  User,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Toaster } from '@/components/ui/sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import React from 'react'
import type { Session } from 'next-auth'

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
  session: Session | null
}) {
  const pathname = usePathname()
  const mobileNavItems = [...navItems, { name: 'Developer', href: '/developer', icon: Code2 }]

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar - Floating style */}
      <aside className="fixed left-3 top-3 bottom-3 hidden w-56 md:block lg:left-4 lg:top-4 lg:bottom-4 lg:w-64 z-40">
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

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 px-3 py-3">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700">Note</p>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <ExternalLink size={12} />
                </span>
                Rounded external-link symbol refers to public page.
              </div>
            </div>
          </nav>

          <div className="px-4 pb-2">
            <Link
              href="/developer"
              className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                pathname === '/developer'
                  ? 'text-primary bg-primary/5 border border-primary/10'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Code2 size={20} className={pathname === '/developer' ? 'text-primary' : 'text-slate-400'} />
              <span>Developer</span>
            </Link>
          </div>

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
      <main className="flex-1 md:pl-64 lg:pl-72">
        <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#f8fafc]/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/event-types" className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                <Calendar size={18} />
              </span>
              <span className="text-base font-bold tracking-tight">KalClone</span>
            </Link>

            <Dialog>
              <DialogTrigger render={
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
                  aria-label="Open menu"
                >
                  <Menu size={18} />
                </button>
              } />
              <DialogContent className="max-w-[calc(100%-1.25rem)] rounded-3xl p-5">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Menu</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 pt-2">
                  {mobileNavItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                          isActive
                            ? 'bg-primary/5 text-primary border border-primary/15'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <item.icon size={16} />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-bold text-red-500"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {mobileNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
                    isActive
                      ? 'border-primary/20 bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <item.icon size={14} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 md:p-8 lg:p-12">
          {children}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  )
}
