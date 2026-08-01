'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { SearchInput } from '@/components/ui/SearchInput'
import {
  Search, Globe, Cpu, FileText, MessageSquare,
  BarChart3, Shield, Zap, Users,
  TrendingUp, Network
} from 'lucide-react'
import Link from 'next/link'

// Fade-in animation for sections
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Enter a Company',
    desc: 'Type a company name or paste its website URL — Nexora handles the rest automatically.',
  },
  {
    step: '2',
    title: 'AI Crawls the Web',
    desc: 'Our agents collect data from the company site, news, LinkedIn, GitHub, filings, and public sources.',
  },
  {
    step: '3',
    title: 'Deep Analysis',
    desc: 'Large language models analyze the gathered data — business model, financials, SWOT, competitors.',
  },
  {
    step: '4',
    title: 'Executive Report',
    desc: 'A comprehensive, structured intelligence report is generated with charts, scores, and citations.',
  },
]

const FEATURES_PREVIEW = [
  { icon: BarChart3, label: 'Financial Intelligence', desc: 'Revenue, funding, valuation from public data' },
  { icon: TrendingUp, label: 'Competitor Analysis', desc: 'Identify and benchmark top competitors' },
  { icon: Shield, label: 'SWOT Analysis', desc: 'AI-generated strengths, weaknesses, opportunities, threats' },
  { icon: Network, label: 'Knowledge Graph', desc: 'Visualize company relationships and connections' },
  { icon: Zap, label: 'AI Scores', desc: 'Business health, innovation, and growth potential scores' },
  { icon: Users, label: 'Leadership Profiles', desc: 'CEO, founders, and key executive information' },
]

export default function LandingPage() {
  return (
    <div className="w-full relative bg-nexora-warmwhite min-h-screen">


      {/* Subtle Corner Analytics (Opacity 10%) */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden max-w-[1400px] mx-auto z-0">
        <div className="absolute top-[20%] left-[10%] opacity-10">
          <TrendingUp className="w-24 h-24 text-nexora-emerald" strokeWidth={1} />
        </div>
        <div className="absolute top-[30%] right-[10%] opacity-10">
           <BarChart3 className="w-32 h-32 text-nexora-emerald" strokeWidth={1} />
        </div>
        <div className="absolute bottom-[20%] left-[12%] opacity-10">
           <Network className="w-28 h-28 text-nexora-emerald" strokeWidth={1} />
        </div>
        <div className="absolute bottom-[25%] right-[15%] opacity-10 flex gap-1 items-end h-24">
           {[30, 45, 25, 60, 40, 80].map((h, i) => (
             <div key={i} className="w-4 bg-nexora-emerald rounded-sm" style={{ height: `${h}%` }} />
           ))}
        </div>
      </div>

      {/* ─── HERO SECTION ─────────────────────────────── */}
      <section className="relative z-10 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center pt-8 pb-20 px-6">
        <div className="w-full max-w-[800px] mx-auto flex flex-col items-center text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-16 h-16 mx-auto bg-white/5 border border-white/10 rounded-2xl p-3 shadow-glass flex items-center justify-center">
              <img src="/logo.png" alt="Nexora AI" className="w-full h-full object-contain" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full mb-8"
          >
            <SearchInput large autoFocus className="max-w-[700px] mx-auto" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center items-center gap-3 text-sm text-nexora-mediumgray"
          >
            <span className="font-medium">Popular:</span>
            {['Apple', 'NVIDIA', 'Stripe', 'Tesla', 'OpenAI'].map(company => (
              <button 
                key={company}
                className="hover:text-white hover:bg-white/10 px-3 py-1 rounded-full transition-colors border border-transparent hover:border-white/10"
              >
                {company}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CONTINUOUS CONTENT SECTION ─────────────────────────────── */}
      <section className="relative z-10 pb-32 px-6">
        <div className="max-w-[800px] mx-auto">
          
          <div className="w-full h-px bg-white/5 mb-24" />

          {/* How It Works */}
          <FadeIn>
            <div className="mb-24">
              <h2 className="text-2xl font-bold text-nexora-charcoal mb-8 tracking-tight">How it works</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {HOW_IT_WORKS.map((item, i) => (
                  <div key={i} className="p-6 bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-all">
                    <div className="text-nexora-mediumgray font-medium text-sm mb-3">Step {item.step}</div>
                    <h3 className="text-lg font-semibold text-nexora-charcoal mb-2">{item.title}</h3>
                    <p className="text-nexora-mediumgray leading-relaxed text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Capabilities */}
          <FadeIn delay={0.1}>
            <div className="mb-24">
              <h2 className="text-2xl font-bold text-nexora-charcoal mb-8 tracking-tight">Capabilities</h2>
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                {FEATURES_PREVIEW.map((feat, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-nexora-emerald/10 flex items-center justify-center shrink-0">
                      <feat.icon className="w-5 h-5 text-nexora-emerald" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-nexora-charcoal mb-1">{feat.label}</h4>
                      <p className="text-sm text-nexora-mediumgray leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────── */}
      <footer className="w-full border-t border-black/5 bg-white py-12 px-6 relative z-10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6">
              <img src="/logo.png" alt="Nexora" className="w-full h-full object-contain grayscale opacity-60" />
            </div>
            <span className="font-bold text-sm text-nexora-mediumgray tracking-tight">Nexora AI</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-nexora-mediumgray">
            <Link href="#" className="hover:text-nexora-charcoal transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-nexora-charcoal transition-colors">Terms</Link>
            <Link href="#" className="hover:text-nexora-charcoal transition-colors">Documentation</Link>
          </div>
          <div className="text-xs text-nexora-mediumgray/60 font-medium">
            © 2026 Nexora Intelligence. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  )
}
