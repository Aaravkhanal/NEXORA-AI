'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Building2, FileText, Zap, 
  Target, Bookmark, Newspaper, MessageSquare, 
  Settings, HelpCircle, Eye, Sparkles, X
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  closeSidebar: () => void
}

export function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const pathname = usePathname()

  const mainNav = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Companies', href: '#', icon: Building2 },
    { name: 'Reports', href: '#', icon: FileText },
    { name: 'Competitors', href: '#', icon: Zap },
    { name: 'Market Analysis', href: '#', icon: Target },
  ]

  const myWorkNav = [
    { name: 'Watchlists', href: '#', icon: Eye },
    { name: 'Saved Companies', href: '#', icon: Bookmark },
    { name: 'News Feed', href: '#', icon: Newspaper },
    { name: 'AI Assistant', href: '/assistant', icon: MessageSquare, highlight: true },
  ]

  const bottomNav = [
    { name: 'Settings', href: '#', icon: Settings },
    { name: 'Help Center', href: '#', icon: HelpCircle },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-nexora-charcoal/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-nexora-cream border-r border-nexora-border-subtle flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Logo area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-nexora-border-subtle shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            {/* Nexora Owl Icon Placeholder */}
            <div className="w-8 h-8 rounded-lg bg-nexora-charcoal flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
              <span className="text-white font-syne font-bold">N</span>
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-nexora-gold animate-pulse"></div>
            </div>
            <span className="font-syne font-bold text-xl text-nexora-charcoal tracking-tight">
              Nexora
            </span>
          </Link>
          <button onClick={closeSidebar} className="lg:hidden p-1 text-nexora-text-muted hover:text-nexora-charcoal rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation sections */}
        <div className="flex-1 overflow-y-auto py-6 px-4 hide-scrollbar space-y-8">
          
          <div>
            <h4 className="text-xs font-bold text-nexora-text-muted uppercase tracking-wider mb-3 px-3">Overview</h4>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-nexora-charcoal text-white shadow-md' 
                        : 'text-nexora-text-secondary hover:bg-nexora-offwhite hover:text-nexora-charcoal'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-nexora-emerald' : ''}`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div>
            <h4 className="text-xs font-bold text-nexora-text-muted uppercase tracking-wider mb-3 px-3">Workspace</h4>
            <nav className="space-y-1">
              {myWorkNav.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                      isActive 
                        ? 'bg-nexora-charcoal text-white shadow-md' 
                        : item.highlight 
                          ? 'bg-nexora-emerald/10 text-nexora-forest hover:bg-nexora-emerald/20 border border-nexora-emerald/20'
                          : 'text-nexora-text-secondary hover:bg-nexora-offwhite hover:text-nexora-charcoal'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${
                      isActive ? 'text-nexora-emerald' : item.highlight ? 'text-nexora-emerald' : ''
                    }`} />
                    {item.name}
                    {item.highlight && !isActive && (
                      <Sparkles className="w-3 h-3 ml-auto opacity-50 group-hover:animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

        </div>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-nexora-border-subtle shrink-0">
          <nav className="space-y-1">
            {bottomNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-nexora-text-secondary hover:bg-nexora-offwhite hover:text-nexora-charcoal transition-all"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="mt-4 px-3 py-3 bg-nexora-offwhite rounded-xl border border-nexora-border-subtle">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-nexora-emerald animate-pulse"></div>
              <span className="text-xs font-bold text-nexora-charcoal uppercase tracking-wide">System Status</span>
            </div>
            <p className="text-xs text-nexora-text-muted">All intelligence engines active.</p>
          </div>
        </div>
      </aside>
    </>
  )
}
