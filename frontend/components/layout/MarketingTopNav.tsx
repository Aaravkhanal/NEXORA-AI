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
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-black/5 shadow-sm' : 'bg-nexora-warmwhite border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo + Brand Name */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/logo.png"
              alt="Nexora Intelligence"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <span className="font-syne font-bold text-nexora-charcoal text-lg tracking-tight hidden sm:block">
              Nexora <span className="text-nexora-emerald">Intelligence</span>
            </span>
          </Link>

          {/* Desktop Nav Links - Centered */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-2 py-2 text-[15px] font-semibold text-nexora-charcoal group"
              >
                <span className="relative z-10 group-hover:text-nexora-emerald transition-colors duration-300">
                  {link.label}
                </span>
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-nexora-emerald scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-5 py-2.5 text-sm font-bold text-nexora-charcoal hover:bg-black/5 rounded-full transition-colors">
              Log in
            </button>
            <Link
              href="/"
              className="px-6 py-2.5 text-sm font-bold text-white bg-nexora-charcoal hover:bg-nexora-emerald rounded-full transition-colors shadow-premium hover:shadow-premium-hover"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 text-nexora-charcoal hover:bg-black/5 rounded-full transition-colors"
            aria-label="Toggle menu"
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
            className="fixed inset-x-0 top-20 z-40 bg-white/98 backdrop-blur-xl border-b border-black/5 shadow-glass md:hidden"
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
                  className="w-full px-5 py-3 text-sm font-bold text-white text-center bg-nexora-charcoal hover:bg-nexora-emerald rounded-xl transition-colors"
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
