'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, TrendingUp, Sparkles, Target, Zap, Globe, Shield, Clock } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import api, { type ReportListItem } from '@/lib/api'

export default function LandingPage() {
  const [recentReports, setRecentReports] = useState<ReportListItem[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api.listReports()
        // If we want to limit to 4, we can do it on the client side since the API doesn't accept a limit yet
        setRecentReports(data.slice(0, 4))
      } catch (err) {
        console.error("Failed to load reports", err)
      } finally {
        setIsLoadingReports(false)
      }
    }
    fetchReports()
  }, [])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative"
        >
          {/* Mascot / Logo area */}
          <div className="w-24 h-24 bg-nexora-charcoal rounded-3xl flex items-center justify-center shadow-premium relative mx-auto group">
            <span className="text-white font-syne font-bold text-5xl">N</span>
            {/* Sparkle accents */}
            <div className="absolute -top-3 -right-3">
              <Sparkles className="w-8 h-8 text-nexora-gold animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-nexora-emerald rounded-full border-4 border-nexora-cream shadow-sm"></div>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-syne font-bold text-nexora-charcoal tracking-tight leading-[1.15] mb-6"
        >
          Executive Intelligence,<br />
          <span className="text-nexora-emerald">Generated in Seconds.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-nexora-text-secondary max-w-2xl mx-auto mb-10"
        >
          Search any company or website. Nexora AI crawls 8 premium data sources to build an interactive dashboard, financial summary, and RAG knowledge base.
        </motion.p>

        {/* Large Search Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-2xl mx-auto shadow-premium-hover rounded-2xl"
        >
          <SearchInput large autoFocus />
        </motion.div>
        
        {/* Suggested searches */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex flex-wrap justify-center gap-2 items-center text-sm text-nexora-text-muted"
        >
          <span className="mr-2">Try:</span>
          {["Microsoft", "Tesla", "Stripe", "Airbnb", "Nvidia"].map(company => (
            <button key={company} className="px-3 py-1 bg-white border border-nexora-border-subtle rounded-full hover:border-nexora-emerald hover:text-nexora-emerald transition-colors shadow-sm">
              {company}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Grid of features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <Card className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-nexora-warmGreen text-nexora-forest rounded-xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-nexora-charcoal mb-2">Real-time Crawling</h3>
          <p className="text-sm text-nexora-text-secondary">Pulls live data from Wikipedia, news, Crunchbase, and GitHub.</p>
        </Card>
        <Card className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-nexora-softOrange text-nexora-orange rounded-xl flex items-center justify-center mb-4">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-nexora-charcoal mb-2">Competitor Analysis</h3>
          <p className="text-sm text-nexora-text-secondary">Automatically maps market position and identifies direct rivals.</p>
        </Card>
        <Card className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-nexora-charcoal text-white rounded-xl flex items-center justify-center mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-nexora-charcoal mb-2">Executive Summaries</h3>
          <p className="text-sm text-nexora-text-secondary">Generates SWOT matrices and strategic recommendations.</p>
        </Card>
      </div>

      {/* Recent Reports */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-syne font-bold text-nexora-charcoal">Recent Intelligence</h2>
            <p className="text-sm text-nexora-text-muted mt-1">Recently generated company dashboards.</p>
          </div>
          <Link href="/reports" className="text-sm font-semibold text-nexora-emerald hover:text-nexora-forest flex items-center gap-1 group">
            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingReports ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-nexora-border-subtle p-6 h-48 skeleton"></div>
            ))
          ) : recentReports.length > 0 ? (
            recentReports.map(report => (
              <Link key={report.id} href={`/report/${report.id}`}>
                <Card className="h-full group hover:border-nexora-emerald/30 cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-nexora-offwhite flex items-center justify-center group-hover:scale-110 transition-transform">
                      {report.company_name ? (
                        <span className="font-bold text-lg text-nexora-charcoal">{report.company_name.charAt(0)}</span>
                      ) : (
                        <Building2 className="w-5 h-5 text-nexora-text-muted" />
                      )}
                    </div>
                    {report.status === 'completed' ? (
                      <Badge variant="emerald">Ready</Badge>
                    ) : (
                      <Badge variant="amber">Processing</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-nexora-charcoal line-clamp-1 mb-1 group-hover:text-nexora-emerald transition-colors">
                    {report.company_name || 'Unknown Company'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-nexora-text-muted mt-4">
                    <Clock className="w-3 h-3" />
                    {new Date(report.created_at).toLocaleDateString()}
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-4 py-12 text-center border-2 border-dashed border-nexora-border-subtle rounded-2xl">
              <Building2 className="w-12 h-12 text-nexora-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-nexora-text-secondary">No reports generated yet.</p>
              <p className="text-sm text-nexora-text-muted mt-1">Search for a company above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
