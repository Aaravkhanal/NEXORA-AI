'use client'

import React from 'react'
import Link from 'next/link'
import { Bell, HelpCircle, UserCircle, Menu } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'

export function TopNav({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-nexora-border-subtle h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-nexora-text-muted hover:text-nexora-navy rounded-lg hover:bg-nexora-offwhite transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:block max-w-md w-full ml-4 lg:ml-6">
          <SearchInput />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="p-2 text-nexora-text-muted hover:text-nexora-navy rounded-full hover:bg-nexora-offwhite transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-nexora-green rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 text-nexora-text-muted hover:text-nexora-navy rounded-full hover:bg-nexora-offwhite transition-colors hidden sm:block">
          <HelpCircle className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-nexora-border-subtle mx-1 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 p-1.5 hover:bg-nexora-offwhite rounded-full transition-colors">
            <UserCircle className="w-7 h-7 text-nexora-text-secondary" />
          </button>
        </div>
      </div>
    </header>
  )
}
