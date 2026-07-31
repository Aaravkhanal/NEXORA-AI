'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Building2, FileText, 
  Target, Bookmark, Newspaper, MessageSquare, 
  Settings, HelpCircle, X, ChevronDown
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  closeSidebar: () => void
}

export function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '#', icon: LayoutDashboard },
    { name: 'Companies', href: '#', icon: Building2 },
    { name: 'Reports', href: '#', icon: FileText },
    { name: 'Competitors', href: '#', icon: Target },
    { name: 'Watchlists', href: '#', icon: Bookmark },
    { name: 'News', href: '#', icon: Newspaper },
    { name: 'AI Assistant', href: '#', icon: MessageSquare, badge: 'New' },
  ]

  const bottomNav = [
    { name: 'Settings', href: '#', icon: Settings },
    { name: 'Help & Docs', href: '#', icon: HelpCircle },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] lg:static lg:flex-shrink-0 bg-nexora-white border-r border-black/5 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Logo area */}
        <div className="h-20 flex items-center justify-between px-6 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="Nexora Intelligence" className="h-10 object-contain group-hover:scale-105 transition-transform" />
          </Link>
          <button onClick={closeSidebar} className="lg:hidden p-1 text-nexora-mediumgray hover:text-nexora-black rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation sections */}
        <div className="flex-1 overflow-y-auto py-4 px-4 hide-scrollbar space-y-1">
          {navItems.map((item) => {
            const isActive = item.name === 'Dashboard' // Mocking active state for now
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  isActive 
                    ? 'text-nexora-emerald bg-nexora-emerald/10' 
                    : 'text-nexora-charcoal hover:bg-nexora-lightgray'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-nexora-emerald' : 'text-nexora-mediumgray group-hover:text-nexora-charcoal transition-colors'}`} />
                  {item.name}
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-nexora-emerald bg-nexora-emerald/10 rounded-full uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="p-4 space-y-1">
          {bottomNav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-nexora-charcoal hover:bg-nexora-lightgray transition-all group"
            >
              <item.icon className="w-5 h-5 text-nexora-mediumgray group-hover:text-nexora-charcoal transition-colors" />
              {item.name}
            </Link>
          ))}
          
          <div className="mt-4 pt-4 border-t border-black/5">
            <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-nexora-lightgray transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-nexora-emerald text-white flex items-center justify-center font-bold font-syne text-lg">
                  A
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-nexora-charcoal leading-none">Aarav Khanal</p>
                  <p className="text-xs text-nexora-mediumgray mt-1">Pro Plan</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-nexora-mediumgray group-hover:text-nexora-charcoal transition-colors" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
