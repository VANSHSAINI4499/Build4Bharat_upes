'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Accessibility } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
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
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
