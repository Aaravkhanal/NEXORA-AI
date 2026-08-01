'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  Search, Globe, BarChart3, Target, Brain, FileText, MessageSquare,
  Network, Cpu, Map, TrendingUp, Shield, Layers, Zap, ArrowRight
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

const FEATURES = [
  {
    icon: Search,
    title: 'AI Company Research',
    desc: 'Nexora automatically discovers and crawls company websites, press releases, LinkedIn, Crunchbase, and news sources to build a rich knowledge base — no manual research required.',
    badge: 'Core',
    color: 'emerald',
    highlights: ['Automatic website crawling', 'Multi-source data fusion', 'Structured knowledge extraction', 'Real-time data collection'],
  },
  {
    icon: Target,
    title: 'Competitor Analysis',
    desc: 'Automatically identify competitors, benchmark them side-by-side, and understand competitive positioning with radar charts and feature comparison matrices.',
    badge: 'Intelligence',
    color: 'orange',
    highlights: ['Auto competitor discovery', 'Side-by-side benchmarking', 'Feature matrix comparison', 'Market positioning maps'],
  },
  {
    icon: Shield,
    title: 'SWOT Analysis',
    desc: 'AI-generated SWOT analysis grounded in real evidence. Every strength, weakness, opportunity, and threat is backed by sourced data — not guesswork.',
    badge: 'Strategy',
    color: 'amber',
    highlights: ['Evidence-backed insights', 'Structured strengths/weaknesses', 'Market opportunities', 'Risk identification'],
  },
  {
    icon: BarChart3,
    title: 'Financial Intelligence',
    desc: 'Surface publicly available financial data — revenue, funding rounds, valuations, investor lists, and profitability indicators — with clear confidence labels.',
    badge: 'Finance',
    color: 'emerald',
    highlights: ['Funding history', 'Revenue estimates', 'Valuation tracking', 'Investor identification'],
  },
  {
    icon: FileText,
    title: 'Executive Reports',
    desc: 'Generate comprehensive, print-ready executive reports with all intelligence sections organized into a professional dashboard — share or export as PDF.',
    badge: 'Output',
    color: 'forest',
    highlights: ['Full dashboard view', 'PDF export', 'Share via link', 'Version history'],
  },
  {
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    desc: 'After analysis, ask follow-up questions in natural language. The RAG-powered assistant answers using the company\'s knowledge base with cited sources.',
    badge: 'AI',
    color: 'emerald',
    highlights: ['RAG-powered answers', 'Source citations', 'Conversation history', 'Markdown responses'],
  },
  {
    icon: TrendingUp,
    title: 'Growth Analysis',
    desc: 'Track company growth trajectory including expansion, hiring trends, product launches, milestones, and recent developments — visualized as timelines.',
    badge: 'Growth',
    color: 'amber',
    highlights: ['Company milestones', 'Expansion tracking', 'Product launch history', 'Hiring signals'],
  },
  {
    icon: Cpu,
    title: 'Technology Stack Detection',
    desc: 'Detect the technologies powering a company: frontend, backend, cloud infrastructure, databases, AI tools, payment providers, and analytics platforms.',
    badge: 'Tech',
    color: 'orange',
    highlights: ['Frontend / backend stack', 'Cloud providers', 'AI & ML tools', 'Payment & analytics'],
  },
  {
    icon: Network,
    title: 'Knowledge Graph',
    desc: 'Visualize the company\'s ecosystem: founders, investors, partners, competitors, and technologies as an interactive relationship graph.',
    badge: 'Visualization',
    color: 'forest',
    highlights: ['Company relationships', 'Investor networks', 'Competitor mapping', 'Technology connections'],
  },
  {
    icon: Map,
    title: 'Geographic Presence',
    desc: 'Map where a company operates globally — headquarters, offices, key markets, and expansion trajectory displayed on an interactive world view.',
    badge: 'Geography',
    color: 'emerald',
    highlights: ['HQ & office locations', 'Country presence', 'Regional expansion', 'Key market identification'],
  },
  {
    icon: Brain,
    title: 'AI Intelligence Scores',
    desc: 'Quantify company health with eight AI-generated scores: business health, innovation index, AI readiness, growth potential, and more.',
    badge: 'Scoring',
    color: 'amber',
    highlights: ['Business health score', 'Innovation index', 'AI readiness', 'Risk assessment'],
  },
  {
    icon: Layers,
    title: 'Multi-Source Fusion',
    desc: 'Data from 50+ public sources is automatically merged, deduplicated, and graded by confidence level — so you always know how reliable each data point is.',
    badge: 'Data',
    color: 'orange',
    highlights: ['50+ public sources', 'Confidence labeling', 'Deduplication', 'Source citations'],
  },
]

const colorMap: Record<string, string> = {
  emerald: 'bg-nexora-emerald/10 text-nexora-emerald',
  orange: 'bg-nexora-orange/10 text-nexora-orange',
  amber: 'bg-nexora-amber/10 text-nexora-gold',
  forest: 'bg-nexora-forest/10 text-nexora-forest',
}

export default function FeaturesPage() {
  return (
    <div className="bg-nexora-warmwhite min-h-screen">

      {/* Hero */}
      <section className="relative bg-white border-b border-black/5 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-nexora-emerald/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-nexora-emerald bg-nexora-emerald/10 rounded-full mb-6">
              Platform Features
            </span>
            <h1 className="text-5xl md:text-6xl font-syne font-bold text-nexora-charcoal tracking-tight mb-6">
              Intelligence for Every<br />
              <span className="text-nexora-emerald">Business Dimension</span>
            </h1>
            <p className="text-xl text-nexora-mediumgray max-w-2xl mx-auto mb-8 leading-relaxed">
              Nexora bundles an entire research team into a single AI platform. From financial data to technology stacks, every capability you need — in one dashboard.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-nexora-charcoal text-white text-sm font-bold rounded-2xl hover:bg-nexora-emerald transition-colors shadow-sm"
            >
              Try It Now — Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <FadeIn key={i} delay={i * 0.04}>
                <div className="bg-white rounded-3xl p-7 border border-black/5 hover:border-nexora-emerald/30 hover:shadow-premium-hover transition-all group h-full flex flex-col">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[feature.color]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-nexora-warmwhite rounded-full text-nexora-mediumgray uppercase tracking-wider">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="font-syne font-bold text-nexora-charcoal text-lg mb-3 group-hover:text-nexora-emerald transition-colors">{feature.title}</h3>
                  <p className="text-sm text-nexora-mediumgray leading-relaxed mb-5 flex-1">{feature.desc}</p>
                  <ul className="space-y-2">
                    {feature.highlights.map((h, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-nexora-charcoal font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-nexora-emerald shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-nexora-charcoal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-nexora-emerald/10 via-transparent to-transparent pointer-events-none" />
        <FadeIn className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-syne font-bold text-white mb-4">Ready to Research Smarter?</h2>
          <p className="text-nexora-mediumgray mb-8">
            All these capabilities are available right now. Enter any company name and Nexora does the rest.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-nexora-emerald text-white text-sm font-bold rounded-2xl hover:bg-nexora-forest transition-colors">
            Start for Free <ArrowRight className="w-4 h-4" />
          </Link>
        </FadeIn>
      </section>
    </div>
  )
}
