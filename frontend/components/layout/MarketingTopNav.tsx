'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/about' },
]

export function MarketingTopNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { label: 'Features', href: '/features' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Resources', href: '/resources' },
    { label: 'About', href: '/about' },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-nexora-warmwhite/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/logo.png" alt="Nexora AI" className="h-full object-contain" />
            </div>
            <span className="font-syne font-bold text-lg text-nexora-charcoal tracking-tight">
              Nexora AI
            </span>
          </Link>

          {/* Desktop Description - Centered */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center w-full max-w-2xl px-4 pointer-events-none">
            <p className="text-[12px] md:text-[13px] text-nexora-mediumgray text-center font-medium leading-snug">
              AI-Powered Company Intelligence Platform delivering collaborative multi-agent business research, financial insights, risk analysis, and strategic intelligence.
            </p>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button className="text-[14px] font-medium text-nexora-mediumgray hover:text-white transition-colors">
              Log in
            </button>
            <Link
              href="/"
              className="px-5 py-2 text-[14px] font-medium text-white bg-nexora-emerald hover:bg-nexora-forest rounded-full transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 text-nexora-charcoal"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-white/98 backdrop-blur-xl border-b border-black/5 shadow-sm md:hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-3 text-sm font-semibold text-nexora-charcoal hover:text-nexora-emerald hover:bg-nexora-emerald/5 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 pb-2 flex flex-col gap-2">
                <button className="w-full px-5 py-3 text-sm font-bold text-nexora-charcoal border border-black/10 hover:bg-black/5 rounded-xl transition-colors">
                  Log in
                </button>
                <Link
                  href="/"
                  className="w-full px-5 py-3 text-sm font-bold text-white text-center bg-nexora-emerald hover:bg-nexora-forest rounded-xl transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
