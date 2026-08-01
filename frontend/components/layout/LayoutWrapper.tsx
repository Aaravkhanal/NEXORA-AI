'use client'

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { DashboardTopNav } from './DashboardTopNav'
import { MarketingTopNav } from './MarketingTopNav'
import { MessageSquare } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { AssistantPanel } from './AssistantPanel'

// Pages that use the marketing layout (full-width, no sidebar)
const MARKETING_PATHS = ['/', '/features', '/solutions', '/resources', '/about']

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const pathname = usePathname()

  const isMarketingPage = MARKETING_PATHS.includes(pathname)

  const renderChatbotIcon = () => (
    <>
      {!assistantOpen && (
        <button
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-6 right-6 w-[60px] h-[60px] bg-nexora-emerald/90 backdrop-blur-md border border-white/20 rounded-full shadow-premium hover:shadow-premium-hover hover:scale-105 transition-all duration-300 flex items-center justify-center z-40 group"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="w-7 h-7 text-white drop-shadow-md" />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-nexora-emerald animate-ping opacity-20 pointer-events-none" />
          {/* Notification dot */}
          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-nexora-amber rounded-full border-2 border-white shadow-sm" />
        </button>
      )}
      <AssistantPanel isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  )

  if (isMarketingPage) {
    return (
      <div className="flex flex-col min-h-screen bg-nexora-warmwhite text-nexora-black selection:bg-nexora-emerald/20 selection:text-nexora-emerald">
        <MarketingTopNav />
        <main className="flex-1">
          {children}
        </main>
        {renderChatbotIcon()}
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
      </div>

      {renderChatbotIcon()}
    </div>
  )
}
