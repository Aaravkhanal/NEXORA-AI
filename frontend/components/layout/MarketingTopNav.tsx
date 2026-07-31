'use client'

import React from 'react'
import Link from 'next/link'
import { Sun } from 'lucide-react'

export function MarketingTopNav() {
  return (
    <nav className="w-full bg-nexora-warmwhite border-b border-transparent">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="Nexora Intelligence" className="h-10 object-contain group-hover:scale-105 transition-transform" />
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-semibold text-nexora-charcoal hover:text-nexora-emerald transition-colors">Features</Link>
          <Link href="#solutions" className="text-sm font-semibold text-nexora-charcoal hover:text-nexora-emerald transition-colors">Solutions</Link>
          <Link href="#resources" className="text-sm font-semibold text-nexora-charcoal hover:text-nexora-emerald transition-colors">Resources</Link>
          <Link href="#pricing" className="text-sm font-semibold text-nexora-charcoal hover:text-nexora-emerald transition-colors">Pricing</Link>
          <Link href="#about" className="text-sm font-semibold text-nexora-charcoal hover:text-nexora-emerald transition-colors">About</Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-nexora-amber hover:bg-nexora-amber/10 rounded-full transition-colors">
            <Sun className="w-5 h-5" />
          </button>
          
          <button className="hidden sm:block px-5 py-2 text-sm font-bold text-nexora-charcoal hover:bg-black/5 rounded-full transition-colors border border-transparent hover:border-black/10">
            Log in
          </button>
          
          <button className="px-6 py-2.5 text-sm font-bold text-white bg-nexora-forest hover:bg-nexora-emerald rounded-full transition-colors shadow-sm hover:shadow-md">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}
