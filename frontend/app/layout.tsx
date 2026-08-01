import type { Metadata } from 'next'
import './globals.css'
import LayoutWrapper from '@/components/layout/LayoutWrapper'

export const metadata: Metadata = {
  title: 'Nexora AI | Executive Intelligence',
  description: 'Transforming Public Data into Executive Intelligence',
  keywords: ['company research', 'AI intelligence', 'competitor analysis', 'business intelligence', 'RAG chatbot'],
  authors: [{ name: 'Nexora AI' }],
  openGraph: {
    title: 'Nexora AI | Executive Intelligence',
    description: 'Transforming Public Data into Executive Intelligence',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased selection:bg-nexora-green/20 selection:text-nexora-green">
      <body className="h-full bg-nexora-cream text-nexora-navy font-sans">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  )
}
