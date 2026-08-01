'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  BookOpen, Code2, PlayCircle, HelpCircle, Newspaper,
  GitBranch, ChevronDown, ArrowRight, Lightbulb,
  Zap, Settings, FileText
} from 'lucide-react'

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  )
}

const RESOURCE_SECTIONS = [
  {
    category: 'Get Started',
    items: [
      {
        icon: BookOpen,
        title: 'User Guide',
        desc: 'A complete step-by-step guide to using Nexora Intelligence — from your first company search to generating and sharing executive reports.',
        tag: 'Guide',
        color: 'emerald',
      },
      {
        icon: PlayCircle,
        title: 'Video Tutorials',
        desc: 'Walkthrough videos for every major feature: company analysis, competitor benchmarking, the AI chat assistant, and report export.',
        tag: 'Video',
        color: 'orange',
      },
      {
        icon: Zap,
        title: 'Quickstart',
        desc: 'New to Nexora? Be up and running in under 3 minutes. This guide covers your first company analysis end-to-end.',
        tag: 'Quick',
        color: 'amber',
      },
    ],
  },
  {
    category: 'Developers',
    items: [
      {
        icon: Code2,
        title: 'API Documentation',
        desc: 'Full REST API reference for integrating Nexora into your own workflows, tools, or dashboards. Includes authentication, endpoints, and code examples.',
        tag: 'API',
        color: 'forest',
      },
      {
        icon: Settings,
        title: 'Configuration Reference',
        desc: 'Detailed configuration options for the Nexora backend: environment variables, LLM providers, crawler settings, and storage configuration.',
        tag: 'Config',
        color: 'orange',
      },
      {
        icon: GitBranch,
        title: 'Changelog',
        desc: 'Track every improvement, bug fix, and new feature added to the Nexora platform. Updated with every release.',
        tag: 'Updates',
        color: 'amber',
      },
    ],
  },
  {
    category: 'Learn & Improve',
    items: [
      {
        icon: Lightbulb,
        title: 'Best Practices',
        desc: 'Expert tips on getting the most accurate and actionable intelligence from Nexora: search strategies, result interpretation, and workflow integration.',
        tag: 'Tips',
        color: 'emerald',
      },
      {
        icon: HelpCircle,
        title: 'FAQ',
        desc: 'Answers to the most common questions: data sources, accuracy, privacy, supported company types, and how the AI models work.',
        tag: 'FAQ',
        color: 'amber',
      },
      {
        icon: Newspaper,
        title: 'Blog',
        desc: 'Insights on AI-powered company research, competitive intelligence best practices, and the latest in business intelligence technology.',
        tag: 'Blog',
        color: 'orange',
      },
    ],
  },
]

const colorMap: Record<string, string> = {
  emerald: 'bg-nexora-emerald/10 text-nexora-emerald',
  orange: 'bg-nexora-orange/10 text-nexora-orange',
  amber: 'bg-nexora-amber/10 text-nexora-gold',
  forest: 'bg-nexora-forest/10 text-nexora-forest',
}

const FAQ_ITEMS = [
  {
    q: 'Where does Nexora get its data?',
    a: 'Nexora collects data from 50+ public sources including company websites, Crunchbase, LinkedIn, GitHub, news articles, press releases, SEC filings (for public companies), and more. All data is publicly available.',
  },
  {
    q: 'How accurate is the financial data?',
    a: 'Financial data varies by company type. Public company data (revenue, market cap) is sourced from official filings and is highly accurate. For private companies, Nexora presents estimates with a clear confidence label — never fabricating values.',
  },
  {
    q: 'How long does a company analysis take?',
    a: 'Most analyses complete in 2–5 minutes. Complex companies with large web presences or many competitors may take slightly longer. You can track progress in real-time.',
  },
  {
    q: 'Can I export the report?',
    a: 'Yes. Reports can be exported as PDF or JSON. You can also share a report via a shareable link directly from the dashboard.',
  },
  {
    q: 'Is the AI chat assistant trained on my company\'s data?',
    a: 'No — the assistant uses Retrieval-Augmented Generation (RAG). It answers questions using only the data collected for that specific analysis, not a general language model training set.',
  },
]

function FAQItem({ q, a }: { q: string, a: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="border border-black/5 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-nexora-warmwhite transition-colors"
      >
        <span className="font-semibold text-nexora-charcoal text-sm">{q}</span>
        <ChevronDown className={`w-4 h-4 text-nexora-mediumgray shrink-0 ml-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-5 text-sm text-nexora-mediumgray leading-relaxed">{a}</p>
      </motion.div>
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <div className="bg-nexora-warmwhite min-h-screen">

      {/* Hero */}
      <section className="relative bg-white border-b border-black/5 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-nexora-forest/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-nexora-forest bg-nexora-forest/10 rounded-full mb-6">
              Resources
            </span>
            <h1 className="text-5xl md:text-6xl font-syne font-bold text-nexora-charcoal tracking-tight mb-6">
              Everything You Need<br />
              <span className="text-nexora-emerald">to Master Nexora</span>
            </h1>
            <p className="text-xl text-nexora-mediumgray max-w-2xl mx-auto leading-relaxed">
              Guides, API docs, tutorials, best practices, and FAQs — all in one place to help you get the most out of Nexora Intelligence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Resource Cards */}
      {RESOURCE_SECTIONS.map((section, si) => (
        <section key={si} className={`py-16 ${si % 2 === 0 ? 'bg-nexora-warmwhite' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="mb-10">
              <h2 className="text-2xl font-syne font-bold text-nexora-charcoal">{section.category}</h2>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {section.items.map((item, i) => {
                const Icon = item.icon
                return (
                  <FadeIn key={i} delay={i * 0.08}>
                    <div className="bg-white rounded-3xl p-6 border border-black/5 hover:border-nexora-emerald/30 hover:shadow-premium-hover transition-all group cursor-pointer h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${colorMap[item.color]}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-nexora-warmwhite rounded-full text-nexora-mediumgray uppercase tracking-wider">
                          {item.tag}
                        </span>
                      </div>
                      <h3 className="font-bold text-nexora-charcoal mb-2 group-hover:text-nexora-emerald transition-colors">{item.title}</h3>
                      <p className="text-sm text-nexora-mediumgray leading-relaxed flex-1">{item.desc}</p>
                      <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-nexora-emerald opacity-0 group-hover:opacity-100 transition-opacity">
                        Read more <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          </div>
        </section>
      ))}

      {/* FAQ */}
      <section className="py-20 bg-white border-t border-black/5">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-nexora-amber bg-nexora-amber/10 rounded-full mb-4">FAQ</span>
            <h2 className="text-3xl font-syne font-bold text-nexora-charcoal mb-4">Common Questions</h2>
            <p className="text-nexora-mediumgray">Quick answers to the things people ask most.</p>
          </FadeIn>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <FAQItem q={item.q} a={item.a} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-nexora-charcoal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-nexora-emerald/10 via-transparent to-transparent pointer-events-none" />
        <FadeIn className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-syne font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-nexora-mediumgray mb-8">Jump in and try Nexora — it's the fastest way to understand what it does.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-nexora-emerald text-white text-sm font-bold rounded-2xl hover:bg-nexora-forest transition-colors">
            Try it Now — Free <ArrowRight className="w-4 h-4" />
          </Link>
        </FadeIn>
      </section>
    </div>
  )
}
