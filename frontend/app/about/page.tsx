'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Database, Brain, Shield, Layers, Globe, MessageSquare } from 'lucide-react'

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  )
}

const DATA_SOURCES = [
  'Company websites', 'LinkedIn profiles', 'Crunchbase', 'GitHub', 'News articles',
  'Press releases', 'SEC filings', 'Product Hunt', 'G2 / Capterra', 'SimilarWeb',
  'BuiltWith', 'Job postings', 'Twitter / X', 'YouTube', 'Patent databases',
]

const AI_LAYERS = [
  {
    icon: Database,
    title: 'Data Collection Layer',
    desc: 'Intelligent crawlers collect structured and unstructured data from 50+ public sources. Each source is attributed with a confidence level and timestamp.',
    color: 'emerald',
  },
  {
    icon: Layers,
    title: 'Processing & Fusion',
    desc: 'Raw data is chunked, embedded, and stored in a vector database. Deduplication and source weighting ensures high-quality signals rise to the top.',
    color: 'orange',
  },
  {
    icon: Brain,
    title: 'LLM Analysis',
    desc: 'Large language models analyze structured data across dimensions: business model, financials, SWOT, competitors, technology — producing grounded, cited insights.',
    color: 'amber',
  },
  {
    icon: MessageSquare,
    title: 'RAG Chat Engine',
    desc: 'The assistant uses Retrieval-Augmented Generation to answer follow-up questions using only the collected company data — no hallucinations, real citations.',
    color: 'forest',
  },
]

const colorMap: Record<string, string> = {
  emerald: 'bg-nexora-emerald/10 text-nexora-emerald',
  orange: 'bg-nexora-orange/10 text-nexora-orange',
  amber: 'bg-nexora-amber/10 text-nexora-gold',
  forest: 'bg-nexora-forest/10 text-nexora-forest',
}

export default function AboutPage() {
  return (
    <div className="bg-nexora-warmwhite min-h-screen">

      {/* Hero */}
      <section className="relative bg-white border-b border-black/5 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-nexora-emerald/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-nexora-emerald bg-nexora-emerald/10 rounded-full mb-6">
                About Nexora
              </span>
              <h1 className="text-5xl md:text-6xl font-syne font-bold text-nexora-charcoal tracking-tight mb-6">
                Your AI<br />
                <span className="text-nexora-emerald">Business Analyst</span>
              </h1>
              <p className="text-xl text-nexora-mediumgray leading-relaxed mb-8">
                Nexora Intelligence transforms publicly available data into structured, executive-grade company intelligence — automatically, in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-nexora-charcoal text-white text-sm font-bold rounded-2xl hover:bg-nexora-emerald transition-colors">
                  Try Nexora <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/features" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-black/10 text-nexora-charcoal text-sm font-bold rounded-2xl hover:bg-nexora-warmwhite transition-colors">
                  Explore Features
                </Link>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
                className="w-56 h-56 relative"
              >
                <div className="absolute inset-0 bg-nexora-emerald/10 rounded-full blur-3xl" />
                <img src="/logo.png" alt="Nexora Intelligence" className="w-full h-full object-contain drop-shadow-xl relative z-10" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeIn>
            <div className="bg-white rounded-3xl p-8 border border-black/5 h-full">
              <div className="w-10 h-10 bg-nexora-emerald/10 rounded-2xl flex items-center justify-center mb-5">
                <span className="text-nexora-emerald font-syne font-bold text-lg">M</span>
              </div>
              <h2 className="text-2xl font-syne font-bold text-nexora-charcoal mb-4">Mission</h2>
              <p className="text-nexora-mediumgray leading-relaxed">
                To democratize access to institutional-quality company intelligence. Every founder, analyst, investor, and strategist deserves the same quality of research that was previously only available to large consulting firms and enterprise research teams.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-nexora-charcoal rounded-3xl p-8 h-full">
              <div className="w-10 h-10 bg-nexora-emerald/20 rounded-2xl flex items-center justify-center mb-5">
                <span className="text-nexora-emerald font-syne font-bold text-lg">V</span>
              </div>
              <h2 className="text-2xl font-syne font-bold text-white mb-4">Vision</h2>
              <p className="text-nexora-mediumgray leading-relaxed">
                A world where every business decision is backed by accurate, timely intelligence. Where the question "what do we know about this company?" is answered in minutes rather than weeks — by AI that works around the clock.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How it works / Architecture */}
      <section className="py-20 bg-white border-t border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-nexora-amber bg-nexora-amber/10 rounded-full mb-4">
              AI Architecture
            </span>
            <h2 className="text-3xl font-syne font-bold text-nexora-charcoal mb-3">How Nexora Works Under the Hood</h2>
            <p className="text-nexora-mediumgray max-w-xl mx-auto">
              Nexora is built on a four-layer AI pipeline that ensures grounded, accurate, and cited intelligence.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {AI_LAYERS.map((layer, i) => {
              const Icon = layer.icon
              return (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="bg-nexora-warmwhite rounded-3xl p-6 border border-black/5 h-full relative group hover:shadow-premium-hover transition-all">
                    <div className="absolute top-4 right-4 text-6xl font-syne font-bold text-black/3 select-none">0{i + 1}</div>
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${colorMap[layer.color]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-nexora-charcoal mb-2 text-sm">{layer.title}</h3>
                    <p className="text-xs text-nexora-mediumgray leading-relaxed">{layer.desc}</p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <FadeIn className="text-center mb-12">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-nexora-forest bg-nexora-forest/10 rounded-full mb-4">Data Sources</span>
          <h2 className="text-3xl font-syne font-bold text-nexora-charcoal mb-3">50+ Public Sources. Zero Manual Work.</h2>
          <p className="text-nexora-mediumgray max-w-xl mx-auto">
            Nexora accesses only public data — no scraping behind paywalls, no proprietary databases, no data you'd need permission to use.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {DATA_SOURCES.map((source, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="px-4 py-2 bg-white text-nexora-charcoal text-sm font-semibold rounded-full border border-black/5 hover:border-nexora-emerald/40 hover:text-nexora-emerald transition-all shadow-sm"
              >
                {source}
              </motion.span>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Privacy */}
      <section className="py-20 bg-white border-t border-black/5">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="bg-nexora-warmwhite rounded-3xl p-10 border border-black/5 text-center">
              <div className="w-14 h-14 bg-nexora-emerald/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-7 h-7 text-nexora-emerald" />
              </div>
              <h2 className="text-3xl font-syne font-bold text-nexora-charcoal mb-4">Privacy Commitment</h2>
              <p className="text-nexora-mediumgray leading-relaxed max-w-2xl mx-auto mb-6">
                Nexora only ever accesses publicly available information. We do not collect personal data beyond what is needed to run your analysis. Reports are private to your account. We do not sell your data or share it with third parties. All AI processing happens on secured infrastructure.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {['Public data only', 'Reports stay private', 'No data selling', 'Secure processing'].map(item => (
                  <span key={item} className="px-4 py-2 bg-nexora-emerald/10 text-nexora-forest text-sm font-semibold rounded-full">✓ {item}</span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-nexora-charcoal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-nexora-emerald/10 via-transparent to-transparent pointer-events-none" />
        <FadeIn className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-syne font-bold text-white mb-4">Get in Touch</h2>
          <p className="text-nexora-mediumgray mb-8 leading-relaxed">
            Have questions, feedback, or want to discuss enterprise access? Reach out — we'd love to hear from you.
          </p>
          <a
            href="mailto:hello@nexora.ai"
            className="inline-flex items-center gap-2 px-8 py-4 bg-nexora-emerald text-white text-sm font-bold rounded-2xl hover:bg-nexora-forest transition-colors"
          >
            hello@nexora.ai <ArrowRight className="w-4 h-4" />
          </a>
        </FadeIn>
      </section>
    </div>
  )
}
