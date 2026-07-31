'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Brain, Building2, TrendingUp, Users, Globe, Calendar, DollarSign,
  Shield, Zap, Newspaper, Download, Printer,
  Code2, Target, AlertTriangle, CheckCircle,
  MapPin, Lightbulb, Compass, AlignLeft, Sparkles, Clock, Loader2
} from 'lucide-react'
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts'
import api, { API_BASE } from '@/lib/api'
import { Card, SkeletonCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import ReactMarkdown from 'react-markdown'

// --- Helper Components ---
const SectionHeader = ({ title, icon: Icon, description }: { title: string, icon: any, description?: string }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-nexora-offwhite text-nexora-green rounded-xl border border-nexora-border-subtle shadow-sm">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-2xl font-syne font-bold text-nexora-navy">{title}</h2>
    </div>
    {description && <p className="text-nexora-text-secondary text-sm">{description}</p>}
  </div>
);

export default function ReportPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const id = params.id as string
  const mode = searchParams.get('mode')

  const [report, setReport] = useState<any>(null)
  const [status, setStatus] = useState<any>(null)
  const [progressEvents, setProgressEvents] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'view') {
      loadReport(id)
      return
    }

    const interval = setInterval(async () => {
      try {
        const data = await api.getJobStatus(id)
        setStatus(data)
        
        if (data.status === 'completed' && data.report_id) {
          clearInterval(interval)
          loadReport(data.report_id)
        } else if (data.status === 'failed') {
          clearInterval(interval)
          setError(data.error || 'Research failed')
        }
      } catch (err) {
        console.error(err)
      }
    }, 2000)

    const eventSource = new EventSource(`${API_BASE}/progress/${id}`)
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setProgressEvents(prev => {
        if (prev.find(e => e.message === data.message)) return prev
        return [...prev, data]
      })
    }
    eventSource.onerror = () => eventSource.close()

    return () => {
      clearInterval(interval)
      eventSource.close()
    }
  }, [id, mode])

  const loadReport = async (reportId: string) => {
    try {
      const data = await api.getReport(reportId)
      setReport(data)
      setStatus({ status: 'completed' })
    } catch (err) {
      setError('Failed to load report')
    }
  }

  // --- Loading State ---
  if (status?.status !== 'completed' && !report && !error) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-nexora-cream">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-premium border border-nexora-border-subtle overflow-hidden relative">
          
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-nexora-offwhite">
            <motion.div 
              className="h-full bg-nexora-orange"
              initial={{ width: 0 }}
              animate={{ width: `${status?.progress || 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-nexora-navy text-white rounded-3xl flex items-center justify-center mx-auto mb-6 relative shadow-premium">
              <span className="font-syne font-bold text-3xl">N</span>
              <div className="absolute -inset-2 border-2 border-nexora-orange rounded-[2rem] animate-ping opacity-20"></div>
            </div>
            
            <h2 className="text-2xl font-syne font-bold text-nexora-navy mb-2">
              Analyzing {status?.company_name || 'Company'}
            </h2>
            
            {/* Visual Stepper */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-nexora-text-muted mb-8">
              <span className={status?.progress > 0 ? "text-nexora-orange" : ""}>Crawling sources</span>
              <span className="opacity-50">→</span>
              <span className={status?.progress > 30 ? "text-nexora-orange" : ""}>Synthesizing</span>
              <span className="opacity-50">→</span>
              <span className={status?.progress > 80 ? "text-nexora-orange" : ""}>Building dashboard</span>
            </div>
            
            <div className="bg-nexora-offwhite rounded-2xl p-4 text-left max-h-48 overflow-y-auto hide-scrollbar space-y-3 border border-nexora-border-subtle">
              {progressEvents.map((evt, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 text-sm text-nexora-text-secondary"
                >
                  <CheckCircle className="w-4 h-4 text-nexora-green shrink-0 mt-0.5" />
                  <span className="leading-tight">{evt.message}</span>
                </motion.div>
              ))}
              {progressEvents.length === 0 && (
                <div className="text-sm text-nexora-text-muted text-center py-4 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-nexora-orange" /> Initializing agents...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-nexora-cream p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-nexora-orange mb-4" />
        <h2 className="text-3xl font-syne font-bold mb-2 text-nexora-navy">Intelligence Failure</h2>
        <p className="text-nexora-text-secondary mb-8 max-w-md">{error}</p>
        <button onClick={() => router.push('/')} className="px-6 py-3 bg-nexora-navy text-white rounded-xl hover:bg-nexora-navy-light transition-colors font-medium">Return to Dashboard</button>
      </div>
    )
  }

  if (!report) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-syne font-bold text-nexora-navy tracking-tight">{report.company_name}</h1>
            <Badge variant="outline" className="hidden sm:inline-flex">{report.overview?.industry || 'Technology'}</Badge>
          </div>
          <p className="text-lg text-nexora-text-secondary max-w-3xl">{report.ai_summary?.one_liner || report.overview?.description?.slice(0,100)}</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <a href={api.exportPdfUrl(report.id)} className="flex items-center gap-2 px-4 py-2 bg-white border border-nexora-border-subtle rounded-xl text-sm font-medium text-nexora-navy hover:border-nexora-green hover:text-nexora-green transition-colors shadow-sm">
            <Printer className="w-4 h-4" /> Export PDF
          </a>
          <a href={api.exportJsonUrl(report.id)} className="flex items-center gap-2 px-4 py-2 bg-nexora-navy text-white rounded-xl text-sm font-medium hover:bg-nexora-navy-light transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Raw JSON
          </a>
        </div>
      </div>

      {/* 2. Executive Dashboard (Top Widgets) */}
      <div className="grid md:grid-cols-4 gap-6">
        
        <Card className="md:col-span-3 bg-nexora-navy text-white border-none shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-nexora-green/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-nexora-yellow" />
              <h3 className="font-syne font-bold text-lg">AI Executive Summary</h3>
            </div>
            <p className="text-nexora-offwhite leading-relaxed whitespace-pre-line text-lg font-medium">
              {report.ai_summary?.executive_summary}
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              {report.website && (
                <a href={report.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors border border-white/10">
                  <Globe className="w-4 h-4" /> Official Website
                </a>
              )}
              {report.overview?.headquarters && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-sm border border-white/5">
                  <MapPin className="w-4 h-4 text-nexora-green" /> {report.overview.headquarters}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-syne font-bold text-nexora-navy mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-nexora-green" /> Health Score
            </h3>
            <div className="space-y-5">
              {[
                { label: 'Business Health', score: report.ai_summary?.scores?.business_health, color: 'bg-nexora-green' },
                { label: 'Innovation', score: report.ai_summary?.scores?.innovation, color: 'bg-nexora-navy' },
                { label: 'Market Position', score: report.ai_summary?.scores?.growth_potential, color: 'bg-nexora-yellow' },
              ].map(metric => (
                <div key={metric.label}>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1.5 text-nexora-text-muted">
                    <span>{metric.label}</span>
                    <span className="text-nexora-navy">{metric.score || 0}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-nexora-offwhite rounded-full overflow-hidden">
                    <div className={`h-full ${metric.color} rounded-full`} style={{ width: `${metric.score || 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Key Findings (Opportunities & Risks) */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-nexora-green">
          <h3 className="flex items-center gap-2 text-nexora-green font-bold mb-4 font-syne text-lg">
            <TrendingUp className="w-5 h-5" /> Future Opportunities
          </h3>
          <ul className="space-y-3">
            {report.ai_summary?.future_opportunities?.map((opp: string, i: number) => (
              <li key={i} className="flex gap-3 text-nexora-text-secondary text-sm">
                <CheckCircle className="w-5 h-5 shrink-0 text-nexora-green mt-0.5" />
                <span>{opp}</span>
              </li>
            ))}
          </ul>
        </Card>
        
        <Card className="border-l-4 border-l-nexora-orange">
          <h3 className="flex items-center gap-2 text-nexora-orange font-bold mb-4 font-syne text-lg">
            <AlertTriangle className="w-5 h-5" /> Key Risks & Threats
          </h3>
          <ul className="space-y-3">
            {report.ai_summary?.key_risks?.map((risk: string, i: number) => (
              <li key={i} className="flex gap-3 text-nexora-text-secondary text-sm">
                <Shield className="w-5 h-5 shrink-0 text-nexora-orange mt-0.5" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 4. Competitor Intelligence */}
      {report.competitors && report.competitors.length > 0 && (
        <div className="space-y-6">
          <SectionHeader title="Competitive Intelligence" icon={Zap} description="AI-synthesized landscape and feature matrix." />
          
          {report.competitor_narrative && (
            <Card className="bg-nexora-navy text-white border-none">
              <h3 className="flex items-center gap-2 font-syne font-bold text-xl mb-4 text-white">
                <Compass className="w-5 h-5 text-nexora-green" /> Market Narrative
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-nexora-offwhite leading-relaxed text-sm mb-4">{report.competitor_narrative.summary}</p>
                  <p className="text-nexora-offwhite leading-relaxed text-sm">{report.competitor_narrative.competitive_dynamics}</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h4 className="text-nexora-green font-bold text-xs uppercase tracking-wider mb-2">Moat Analysis</h4>
                    <p className="text-sm text-nexora-offwhite">{report.competitor_narrative.moat_analysis}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {report.competitors.map((comp: any, i: number) => (
              <Card key={i} className="flex flex-col">
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-nexora-navy">{comp.name}</h3>
                  <Badge variant="outline" className="mt-2">{comp.competitive_position || 'Competitor'}</Badge>
                </div>
                <p className="text-nexora-text-secondary text-sm mb-6 flex-1">{comp.overview}</p>
                
                <div className="bg-nexora-offwhite rounded-xl p-3 mt-auto">
                  <h4 className="text-[10px] font-bold text-nexora-text-muted uppercase tracking-wider mb-2">Key Strength</h4>
                  <p className="text-xs text-nexora-navy font-medium">{comp.strengths?.[0] || 'Unknown'}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 5. Business & Financials */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SectionHeader title="Business Model" icon={Building2} />
          <Card>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-nexora-navy mb-2">Core Operations</h4>
                <p className="text-sm text-nexora-text-secondary leading-relaxed">{report.business_model?.core_business}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-nexora-offwhite p-4 rounded-xl">
                  <h4 className="font-bold text-xs text-nexora-text-muted uppercase mb-1">Target Market</h4>
                  <p className="text-sm font-medium text-nexora-navy">{report.business_model?.target_market}</p>
                </div>
                <div className="bg-nexora-green/20 p-4 rounded-xl">
                  <h4 className="font-bold text-xs text-nexora-green uppercase mb-1">Revenue Streams</h4>
                  <ul className="text-sm text-nexora-green font-medium space-y-1">
                    {report.business_model?.revenue_streams?.slice(0,3).map((rs: string, i: number) => (
                      <li key={i} className="line-clamp-1 flex items-center gap-1">
                        <span className="w-1 h-1 bg-nexora-green rounded-full"></span> {rs}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <SectionHeader title="Financial Intel" icon={DollarSign} />
          <Card>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 border border-nexora-border-subtle rounded-xl text-center shadow-sm">
                <h4 className="text-xs text-nexora-text-muted font-bold uppercase mb-1">Estimated Revenue</h4>
                <p className="text-xl font-syne font-bold text-nexora-navy">{report.financials?.estimated_revenue || 'N/A'}</p>
              </div>
              <div className="p-4 border border-nexora-border-subtle rounded-xl text-center shadow-sm">
                <h4 className="text-xs text-nexora-text-muted font-bold uppercase mb-1">Total Funding</h4>
                <p className="text-xl font-syne font-bold text-nexora-green">{report.financials?.total_funding || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-nexora-navy mb-3">Funding History</h4>
              <div className="space-y-3">
                {report.financials?.funding_rounds?.map((round: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-nexora-offwhite rounded-xl text-sm border border-transparent hover:border-nexora-border-subtle transition-colors">
                    <span className="font-medium text-nexora-navy">{round.round}</span>
                    <div className="text-right">
                      <span className="block font-bold text-nexora-green">{round.amount}</span>
                      <span className="text-xs text-nexora-text-muted">{round.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* 6. Technical / Products */}
      {report.products && report.products.length > 0 && (
        <div className="space-y-6">
          <SectionHeader title="Products & Technologies" icon={Code2} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {report.products.map((prod: any, i: number) => (
              <Card key={i} className="hover:border-nexora-green transition-colors cursor-default">
                <h4 className="font-bold text-nexora-navy mb-2">{prod.name}</h4>
                <p className="text-sm text-nexora-text-secondary line-clamp-3">{prod.description}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* 7. Recent News */}
      {report.news && report.news.length > 0 && (
        <div className="space-y-6 pb-24">
          <SectionHeader title="Recent Mentions" icon={Newspaper} />
          <div className="grid md:grid-cols-2 gap-4">
            {report.news.map((n: any, i: number) => (
              <a key={i} href={n.url} target="_blank" rel="noreferrer" className="block group">
                <Card className="h-full flex flex-col justify-between group-hover:shadow-premium-hover group-hover:border-nexora-green/30 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{n.source}</Badge>
                      <span className="text-xs text-nexora-text-muted font-medium">{n.date}</span>
                    </div>
                    <h4 className="font-bold text-nexora-navy group-hover:text-nexora-green transition-colors">{n.title}</h4>
                  </div>
                  {n.sentiment && (
                    <Badge variant={n.sentiment.toLowerCase() === 'positive' ? 'emerald' : n.sentiment.toLowerCase() === 'negative' ? 'rose' : 'default'} className="mt-4 w-fit">
                      {n.sentiment} Impact
                    </Badge>
                  )}
                </Card>
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
