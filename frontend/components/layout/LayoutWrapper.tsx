'use client'

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { usePathname } from 'next/navigation'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // On some routes we might want full screen without sidebar (e.g., login). 
  // For now, assume all routes have it.

  return (
    <div className="flex h-screen overflow-hidden bg-nexora-cream text-nexora-navy selection:bg-nexora-green/20 selection:text-nexora-green">
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 bg-nexora-cream transition-all duration-300 ease-in-out h-full overflow-hidden">
        <TopNav toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto hide-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
