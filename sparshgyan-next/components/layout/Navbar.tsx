'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Accessibility, LogIn, LayoutDashboard } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/captions', label: 'Live Captions' },
  { href: '/vision', label: 'Vision Assist' },
  { href: '/product', label: 'Courses' },
  { href: '/video', label: 'Video' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isListening = useAppStore((s) => s.isListening)
  const { user, loading } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-5 py-3 backdrop-blur-xl shadow-xl shadow-black/20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Accessibility className="h-4 w-4 text-white" />
              </div>
              {isListening && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
              )}
            </div>
            <span className="font-bold text-white text-lg tracking-tight group-hover:text-purple-300 transition-colors">
              Sparshgyan
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/90'
                )}
              >
                {pathname === link.href && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-white/10 border border-white/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Auth button (desktop) */}
          <div className="hidden md:flex items-center gap-2 ml-2">
            {!loading && (
              user ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
                    pathname === '/dashboard'
                      ? 'bg-purple-600 text-white'
                      : 'border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-600/20 px-4 py-2 text-sm font-medium text-purple-300 hover:bg-purple-600/30 transition-all duration-200"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Parent Login
                </Link>
              )
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden rounded-xl border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-2xl border border-white/8 bg-black/80 backdrop-blur-xl p-3 shadow-2xl"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150',
                    pathname === link.href
                      ? 'bg-white/10 text-white border border-white/10'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {/* Auth link in mobile menu */}
              {!loading && (
                <Link
                  href={user ? '/dashboard' : '/login'}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 mt-1 border',
                    user
                      ? 'border-purple-500/20 bg-purple-600/10 text-purple-300'
                      : 'border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {user ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {user ? 'Parent Dashboard' : 'Parent Login'}
                </Link>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
