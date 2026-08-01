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
          className="fixed bottom-6 right-6 w-14 h-14 bg-nexora-emerald rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center z-40 group"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      )}
      <AssistantPanel isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  )

  if (isMarketingPage) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white selection:bg-nexora-emerald/20 selection:text-nexora-emerald">
        <MarketingTopNav />
        <main className="flex-1">
          {children}
        </main>
        {renderChatbotIcon()}
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A] text-white selection:bg-nexora-emerald/20 selection:text-nexora-emerald">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A] transition-all duration-300 ease-in-out h-full overflow-hidden relative">
        <DashboardTopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto hide-scrollbar">
          {children}
        </main>
      </div>

      {renderChatbotIcon()}
    </div>
  )
}
