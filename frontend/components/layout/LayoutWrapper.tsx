'use client'

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { DashboardTopNav } from './DashboardTopNav'
import { MarketingTopNav } from './MarketingTopNav'
import { usePathname } from 'next/navigation'
import { AssistantPanel } from './AssistantPanel'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const pathname = usePathname()

  const isMarketingPage = pathname === '/'

  if (isMarketingPage) {
    return (
      <div className="flex flex-col min-h-screen bg-nexora-warmwhite text-nexora-black selection:bg-nexora-emerald/20 selection:text-nexora-emerald">
        <MarketingTopNav />
        <main className="flex-1">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-nexora-warmwhite text-nexora-black selection:bg-nexora-emerald/20 selection:text-nexora-emerald">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 bg-nexora-warmwhite transition-all duration-300 ease-in-out h-full overflow-hidden relative">
        <DashboardTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto hide-scrollbar">
          {children}
        </main>
        
        {/* Floating Assistant Toggle Button */}
        {!assistantOpen && (
          <button 
            onClick={() => setAssistantOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-nexora-emerald rounded-full shadow-premium hover:shadow-premium-hover hover:scale-105 transition-all duration-300 flex items-center justify-center z-40 group"
          >
            <img src="/owl.png" alt="AI Assistant" className="w-8 h-8 object-contain" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-nexora-amber rounded-full border-2 border-nexora-emerald"></div>
          </button>
        )}
      </div>

      <AssistantPanel isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  )
}
