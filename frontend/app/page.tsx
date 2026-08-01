'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { SearchInput } from '@/components/ui/SearchInput'
import {
  Search, Globe, Cpu, FileText, MessageSquare,
  ArrowRight, BarChart3, Shield, Zap, Users,
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
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: 'Enter a Company',
    desc: 'Type a company name or paste its website URL — Nexora handles the rest automatically.',
    color: 'nexora-emerald',
    bg: 'nexora-emerald/10',
  },
  {
    step: '02',
    icon: Globe,
    title: 'AI Crawls the Web',
    desc: 'Our agents collect data from the company site, news, LinkedIn, GitHub, filings, and 50+ public sources.',
    color: 'nexora-amber',
    bg: 'nexora-amber/10',
  },
  {
    step: '03',
    icon: Cpu,
    title: 'Deep Analysis',
    desc: 'Large language models analyze the gathered data — business model, financials, SWOT, competitors, tech stack.',
    color: 'nexora-orange',
    bg: 'nexora-orange/10',
  },
  {
    step: '04',
    icon: FileText,
    title: 'Executive Report',
    desc: 'A comprehensive, structured intelligence report is generated with charts, scores, and citations.',
    color: 'nexora-forest',
    bg: 'nexora-forest/10',
  },
  {
    step: '05',
    icon: MessageSquare,
    title: 'Ask Follow-ups',
    desc: 'The AI analyst stays on standby. Ask anything about the company — it answers with sourced, grounded responses.',
    color: 'nexora-emerald',
    bg: 'nexora-emerald/10',
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
    <div className="w-full relative overflow-hidden bg-nexora-warmwhite">

      {/* ─── HERO SECTION ─────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center pt-8 pb-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-nexora-emerald/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-nexora-amber/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-nexora-emerald/30 rounded-full animate-pulse-slow pointer-events-none" />
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-nexora-amber/40 rounded-full animate-float pointer-events-none" />

        {/* Floating Analytics Cards (Background Decorations) */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none overflow-hidden max-w-[1400px] mx-auto">
          {/* Top Left: Revenue Growth */}
          <motion.div
            initial={{ opacity: 0, x: -30, y: -20 }}
            animate={{ opacity: 1, x: 0, y: [0, 15, 0] }}
            transition={{ opacity: { duration: 1 }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
            className="absolute top-[15%] left-[8%] bg-white/70 backdrop-blur-md rounded-[20px] p-4 shadow-glass border border-white/40 w-48"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-nexora-emerald/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-nexora-emerald" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider">Revenue YOY</p>
                <p className="text-sm font-bold text-nexora-charcoal">+124.5%</p>
              </div>
            </div>
            <div className="h-8 flex items-end gap-1">
              {[30, 45, 25, 60, 40, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-nexora-emerald" style={{ height: `${h}%`, opacity: 0.4 + (i * 0.1) }} />
              ))}
            </div>
          </motion.div>

          {/* Top Right: AI Score */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
            transition={{ opacity: { duration: 1, delay: 0.2 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 } }}
            className="absolute top-[25%] right-[5%] bg-white/70 backdrop-blur-md rounded-[20px] p-5 shadow-glass border border-white/40 w-44 flex flex-col items-center text-center"
          >
            <div className="relative w-14 h-14 mb-2">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path className="text-black/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className="text-nexora-emerald" strokeDasharray="92, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-nexora-charcoal">92</div>
            </div>
            <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider">Business Health</p>
          </motion.div>

          {/* Bottom Left: Exec Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20, y: 30 }}
            animate={{ opacity: 1, x: 0, y: [0, -15, 0] }}
            transition={{ opacity: { duration: 1, delay: 0.4 }, y: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 } }}
            className="absolute bottom-[20%] left-[5%] bg-white/70 backdrop-blur-md rounded-[20px] p-4 shadow-glass border border-white/40 w-56 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-nexora-emerald/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-nexora-emerald" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-1">Moat Analysis</p>
              <p className="text-xs text-nexora-charcoal leading-relaxed font-medium">Strong network effects with high switching costs.</p>
            </div>
          </motion.div>

          {/* Bottom Right: Financials */}
          <motion.div
            initial={{ opacity: 0, x: 20, y: -30 }}
            animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
            transition={{ opacity: { duration: 1, delay: 0.3 }, y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } }}
            className="absolute bottom-[25%] right-[8%] bg-white/70 backdrop-blur-md rounded-[20px] p-4 shadow-glass border border-white/40 w-48"
          >
            <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-3">Valuation</p>
            <p className="text-2xl font-bold text-nexora-charcoal mb-2">$4.2B</p>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-nexora-emerald bg-nexora-emerald/10 px-2 py-1 rounded-full w-fit">
              <TrendingUp className="w-3 h-3" /> +15% Series C
            </div>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center text-center w-full">
          {/* Premium Branding Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/50 border border-black/5 shadow-sm backdrop-blur-sm mb-4">
              <span className="font-syne font-bold tracking-widest text-xs text-nexora-charcoal uppercase">
                Nexora AI
              </span>
            </div>
            <h2 className="text-[11px] font-bold tracking-[0.2em] text-nexora-emerald uppercase mb-2">
              Executive Intelligence Platform
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-nexora-mediumgray uppercase tracking-widest">
              <span>Research</span>
              <span className="w-1 h-1 rounded-full bg-black/10" />
              <span>Analyze</span>
              <span className="w-1 h-1 rounded-full bg-black/10" />
              <span>Understand</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl xl:text-7xl font-syne font-bold text-nexora-charcoal tracking-tight leading-[1.05] mb-6"
          >
            Understand Any Company<br />
            in <span className="text-nexora-emerald relative inline-block">Minutes.
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-nexora-emerald/20 -z-10 rounded-full blur-[2px]"></span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-nexora-mediumgray max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Nexora AI researches any company, analyzes competitors, maps financials, and delivers executive-grade intelligence instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-2xl mx-auto"
          >
            <SearchInput large autoFocus />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-6 flex flex-wrap justify-center gap-3 items-center text-sm"
          >
            <span className="text-nexora-mediumgray font-bold text-xs uppercase tracking-wider mr-2">Popular:</span>
            {['Apple', 'OpenAI', 'NVIDIA', 'Tesla', 'Stripe', 'Vercel'].map(company => (
              <button
                key={company}
                className="px-4 py-1.5 bg-white border border-black/5 rounded-full hover:border-nexora-emerald/40 hover:bg-nexora-emerald/5 hover:text-nexora-emerald transition-all shadow-sm text-nexora-charcoal text-xs font-semibold"
              >
                {company}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────── */}
      <section className="bg-white border-y border-black/5 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-nexora-emerald bg-nexora-emerald/10 rounded-full mb-3">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-syne font-bold text-nexora-charcoal mb-4">
              From Search to Insight in 5 Steps
            </h2>
            <p className="text-nexora-mediumgray max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              Nexora automates the entire research pipeline — from data collection to executive analysis — in minutes.
            </p>
          </FadeIn>

          <div className="relative mt-12">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-nexora-emerald/20 to-transparent z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
              {HOW_IT_WORKS.map((item, i) => {
                const Icon = item.icon
                return (
                  <FadeIn key={i} delay={i * 0.1}>
                    <div className="flex flex-col items-center text-center group">
                      {/* Step circle */}
                      <div className={`relative w-16 h-16 bg-white border border-black/5 shadow-sm rounded-2xl flex items-center justify-center mb-5 group-hover:-translate-y-1 group-hover:shadow-premium transition-all duration-300 z-10`}>
                        <div className={`absolute inset-0 bg-${item.bg} rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                        <Icon className={`w-7 h-7 text-${item.color} relative z-10`} />
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-nexora-charcoal text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-white z-20">
                          {item.step}
                        </div>
                      </div>
                      <h3 className="font-bold text-nexora-charcoal mb-2 text-sm">{item.title}</h3>
                      <p className="text-[13px] text-nexora-mediumgray leading-relaxed max-w-[200px]">{item.desc}</p>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>

          <FadeIn delay={0.4} className="mt-16 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-nexora-charcoal text-white text-sm font-bold rounded-[14px] hover:bg-nexora-emerald transition-colors shadow-premium hover:shadow-premium-hover"
            >
              Try Nexora Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ─── FEATURES GRID ─────────────────────────────── */}
      <section className="py-20 bg-nexora-warmwhite">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-nexora-amber bg-nexora-amber/10 rounded-full mb-3">
              Platform Capabilities
            </span>
            <h2 className="text-3xl md:text-4xl font-syne font-bold text-nexora-charcoal mb-4">
              Everything You Need to Know
            </h2>
            <p className="text-nexora-mediumgray max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              Nexora synthesizes public data into structured intelligence across every dimension of a company.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {FEATURES_PREVIEW.map((feature, i) => {
              const Icon = feature.icon
              return (
                <FadeIn key={i} delay={i * 0.05} className="h-full">
                  <div className="h-full bg-white rounded-[20px] p-6 border border-black/5 hover:border-nexora-emerald/30 hover:shadow-premium-hover transition-all duration-300 group cursor-default flex flex-col">
                    <div className="w-12 h-12 bg-nexora-emerald/10 rounded-[14px] flex items-center justify-center mb-5 group-hover:bg-nexora-emerald/20 group-hover:scale-105 transition-all">
                      <Icon className="w-6 h-6 text-nexora-emerald" />
                    </div>
                    <h3 className="font-bold text-nexora-charcoal text-base mb-2">{feature.label}</h3>
                    <p className="text-[13px] text-nexora-mediumgray leading-relaxed flex-1">{feature.desc}</p>
                  </div>
                </FadeIn>
              )
            })}
          </div>

          <FadeIn delay={0.3} className="mt-12 text-center">
            <Link href="/features" className="inline-flex items-center gap-2 text-[13px] font-bold text-nexora-charcoal bg-white border border-black/5 shadow-sm px-6 py-3 rounded-full hover:text-nexora-emerald hover:border-nexora-emerald/30 transition-all">
              View all capabilities
              <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─────────────────────────────── */}
      <section className="py-20 bg-nexora-charcoal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-nexora-emerald/10 via-transparent to-transparent pointer-events-none" />
        <FadeIn className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <div className="w-16 h-16 mx-auto bg-nexora-emerald/10 rounded-3xl flex items-center justify-center mb-6 border border-nexora-emerald/20">
            <img src="/logo.png" alt="Nexora" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="text-3xl md:text-4xl font-syne font-bold text-white mb-4">
            Your AI Business Analyst Awaits
          </h2>
          <p className="text-nexora-mediumgray mb-8 leading-relaxed text-sm md:text-base">
            Join teams already using Nexora to research competitors, prepare for meetings, and make faster decisions with AI-powered intelligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-4 bg-nexora-emerald text-white text-sm font-bold rounded-2xl hover:bg-nexora-forest transition-colors shadow-premium hover:shadow-premium-hover"
            >
              Start Researching — It's Free
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white text-sm font-bold rounded-2xl hover:bg-white/10 transition-colors"
            >
              Learn How It Works
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
