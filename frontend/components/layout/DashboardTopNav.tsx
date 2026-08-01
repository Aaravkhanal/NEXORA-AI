'use client'

import React from 'react'
import { Bell, UserCircle, Menu, History } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'

export function DashboardTopNav({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/80 border-b border-white/5 backdrop-blur-xl border-b border-transparent h-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-nexora-mediumgray hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="hidden md:block max-w-xl w-full ml-2">
          <SearchInput />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10">
          <History className="w-4 h-4" />
          Recent Reports
        </button>

        <button className="p-2 text-white hover:bg-white/5 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-nexora-orange rounded-full border border-white"></span>
        </button>
        
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <button className="flex items-center gap-2 p-1 hover:bg-white/5 rounded-full transition-colors">
            <UserCircle className="w-8 h-8 text-nexora-mediumgray" />
          </button>
        </div>
      </div>
    </header>
  )
}
