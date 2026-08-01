'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  Rocket, TrendingUp, DollarSign, Users, Briefcase,
  LineChart, Target, BookOpen, ArrowRight, CheckCircle
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

const SOLUTIONS = [
  {
    icon: Rocket,
    audience: 'Startups',
    tagline: 'Know your competitive landscape before your investors do.',
    desc: 'Startups use Nexora to research potential competitors, understand the market before fundraising, and benchmark their product against established players — in minutes, not weeks.',
    useCases: [
      'Prepare competitive intelligence for investor decks',
      'Identify gaps in the market your startup can fill',
      'Monitor competitor product launches and positioning',
      'Research potential partners and enterprise customers',
    ],
    color: 'emerald',
    gradient: 'from-nexora-emerald/10 to-transparent',
  },
  {
    icon: DollarSign,
    audience: 'Investors & VCs',
    tagline: 'Deeper diligence in a fraction of the time.',
    desc: 'Investment teams use Nexora to accelerate due diligence on portfolio companies and deal targets — surfacing financials, founders, technology choices, and competitive risks automatically.',
    useCases: [
      'Rapid due diligence on startups before term sheets',
      'Portfolio company competitive monitoring',
      'Market landscape analysis for new investment theses',
      'Founder and leadership team research',
    ],
    color: 'amber',
    gradient: 'from-nexora-amber/10 to-transparent',
  },
  {
    icon: Users,
    audience: 'Sales Teams',
    tagline: 'Walk into every call knowing more than your prospect.',
    desc: 'Sales teams use Nexora to research prospects before calls, understand their tech stack, pain points, and competitive situation — so conversations are instantly relevant and contextual.',
    useCases: [
      'Pre-call account intelligence in seconds',
      'Identify prospect technology stack for tailored pitches',
      'Understand prospect business model and challenges',
      'Competitor displacement intelligence',
    ],
    color: 'orange',
    gradient: 'from-nexora-orange/10 to-transparent',
  },
  {
    icon: Briefcase,
    audience: 'Enterprise Strategy',
    tagline: 'M&A intelligence, market entry, and competitive strategy.',
    desc: 'Corporate strategy teams use Nexora for M&A target research, market entry analysis, and competitive landscape mapping — delivering structured intelligence to decision-makers.',
    useCases: [
      'M&A target identification and profiling',
      'Market entry feasibility analysis',
      'Competitive threat assessment',
      'Industry landscape mapping for board presentations',
    ],
    color: 'forest',
    gradient: 'from-nexora-forest/10 to-transparent',
  },
  {
    icon: LineChart,
    audience: 'Market Research',
    tagline: 'Structured company intelligence at research scale.',
    desc: 'Market research analysts use Nexora to profile large sets of companies quickly, extract structured data about technology, business models, and growth trajectories.',
    useCases: [
      'Bulk company profiling for industry reports',
      'Technology adoption tracking across companies',
      'Business model comparison studies',
      'Growth and hiring trend analysis',
    ],
    color: 'emerald',
    gradient: 'from-nexora-emerald/10 to-transparent',
  },
  {
    icon: Target,
    audience: 'Consultants',
    tagline: 'Deliver client insights faster with AI-powered research.',
    desc: 'Consulting firms use Nexora to quickly orient on new client industries, profile key players in a market, and produce competitive analyses that would normally take days of analyst time.',
    useCases: [
      'Client industry orientation in hours',
      'Competitor benchmarking for strategy engagements',
      'Digital maturity assessments',
      'Technology landscape analysis for transformation projects',
    ],
    color: 'amber',
    gradient: 'from-nexora-amber/10 to-transparent',
  },
  {
    icon: BookOpen,
    audience: 'Product Managers',
    tagline: 'Build what matters by knowing what competitors already built.',
    desc: 'Product managers use Nexora to track competitor feature releases, understand their technology stack, and surface opportunities to differentiate their roadmap.',
    useCases: [
      'Competitor feature tracking and gap analysis',
      'Technology stack research for integration decisions',
      'Customer segment and pricing intelligence',
      'Product positioning and messaging research',
    ],
    color: 'orange',
    gradient: 'from-nexora-orange/10 to-transparent',
  },
  {
    icon: TrendingUp,
    audience: 'Business Development',
    tagline: 'Find and qualify partners before your competition does.',
    desc: 'Business development teams use Nexora to research potential partners, acquisition targets, and integration opportunities — understanding compatibility and strategic fit rapidly.',
    useCases: [
      'Partner qualification and profile research',
      'Integration partner technology compatibility',
      'Channel partner intelligence',
      'White-label and acquisition opportunity research',
    ],
    color: 'forest',
    gradient: 'from-nexora-forest/10 to-transparent',
  },
]

const colorMap: Record<string, { icon: string; badge: string; bullet: string }> = {
  emerald: { icon: 'bg-nexora-emerald/10 text-nexora-emerald', badge: 'text-nexora-emerald bg-nexora-emerald/10', bullet: 'bg-nexora-emerald' },
  amber: { icon: 'bg-nexora-amber/10 text-nexora-gold', badge: 'text-nexora-gold bg-nexora-amber/10', bullet: 'bg-nexora-amber' },
  orange: { icon: 'bg-nexora-orange/10 text-nexora-orange', badge: 'text-nexora-orange bg-nexora-orange/10', bullet: 'bg-nexora-orange' },
  forest: { icon: 'bg-nexora-forest/10 text-nexora-forest', badge: 'text-nexora-forest bg-nexora-forest/10', bullet: 'bg-nexora-forest' },
}

export default function SolutionsPage() {
  return (
    <div className="bg-nexora-warmwhite min-h-screen">

      {/* Hero */}
      <section className="relative bg-white border-b border-black/5 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-nexora-amber/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-nexora-amber bg-nexora-amber/10 rounded-full mb-6">
              Solutions
            </span>
            <h1 className="text-5xl md:text-6xl font-syne font-bold text-nexora-charcoal tracking-tight mb-6">
              Built for Every Team<br />
              <span className="text-nexora-emerald">That Makes Decisions</span>
            </h1>
            <p className="text-xl text-nexora-mediumgray max-w-2xl mx-auto leading-relaxed">
              Whether you're raising a round, closing a deal, or building a product roadmap — Nexora delivers the intelligence you need to act with confidence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {SOLUTIONS.map((solution, i) => {
            const Icon = solution.icon
            const colors = colorMap[solution.color]
            return (
              <FadeIn key={i} delay={i * 0.06}>
                <div className={`bg-white rounded-3xl p-8 border border-black/5 hover:border-nexora-emerald/30 hover:shadow-premium-hover transition-all h-full flex flex-col`}>
                  <div className="flex items-start gap-5 mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${colors.icon}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${colors.badge}`}>
                        {solution.audience}
                      </span>
                      <h2 className="font-syne font-bold text-nexora-charcoal text-xl mt-2 leading-tight">{solution.tagline}</h2>
                    </div>
                  </div>
                  <p className="text-sm text-nexora-mediumgray leading-relaxed mb-6">{solution.desc}</p>
                  <div className="space-y-3 flex-1">
                    {solution.useCases.map((useCase, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-nexora-emerald shrink-0 mt-0.5" />
                        <span className="text-sm text-nexora-charcoal font-medium">{useCase}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-black/5">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-nexora-emerald hover:text-nexora-forest transition-colors"
                    >
                      Try Nexora for {solution.audience.split(' ')[0]}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-nexora-charcoal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-nexora-emerald/10 via-transparent to-transparent pointer-events-none" />
        <FadeIn className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-syne font-bold text-white mb-4">One Platform, Every Team</h2>
          <p className="text-nexora-mediumgray mb-8 leading-relaxed">
            Nexora Intelligence works across your entire organization. Start with one team, expand to all.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-nexora-emerald text-white text-sm font-bold rounded-2xl hover:bg-nexora-forest transition-colors">
            Get Started — It's Free <ArrowRight className="w-4 h-4" />
          </Link>
        </FadeIn>
      </section>
    </div>
  )
}
