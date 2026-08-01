'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bookmark, Download, Share2, Building2, MapPin, Globe,
  ExternalLink, Calendar, Users, TrendingUp, DollarSign,
  Cpu, Target, Newspaper, Brain, BarChart3, CheckCircle,
  XCircle, AlertCircle, ArrowUpRight, Clock, GitBranch,
  Layers, Map, Network, ChevronRight, Info, AlertTriangle
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend
} from 'recharts'
import api from '@/lib/api'

// ─── Types ──────────────────────────────────────────────
type Report = any // using backend schema directly

// ─── Helpers ────────────────────────────────────────────
function fmtUSD(val: number | null | undefined): string {
  if (val == null) return 'No public available information found'
  if (val >= 1e12) return `$${(val / 1e12).toFixed(1)}T`
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`
  return `$${val.toLocaleString()}`
}

function confidenceTag(conf: string | null | undefined) {
  if (!conf) return null
  const map: Record<string, { label: string; color: string }> = {
    high: { label: 'Verified', color: 'text-nexora-emerald bg-nexora-emerald/10' },
    medium: { label: 'Estimated', color: 'text-nexora-amber bg-nexora-amber/10' },
    low: { label: 'Unverified', color: 'text-nexora-orange bg-nexora-orange/10' },
  }
  const entry = map[conf] ?? { label: conf, color: 'text-nexora-mediumgray bg-white/5' }
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${entry.color}`}>{entry.label}</span>
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
        <img src="/owl.png" alt="Nexora" className="w-8 h-8 object-contain opacity-40 grayscale" />
      </div>
      <h4 className="font-bold text-white mb-1">{title}</h4>
      <p className="text-sm text-nexora-mediumgray max-w-xs">{desc}</p>
    </div>
  )
}

function ErrorState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white/5 rounded-3xl border border-white/10">
      <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-4 border border-rose-500/20">
        <AlertTriangle className="w-7 h-7 text-rose-400" />
      </div>
      <h4 className="font-bold text-rose-400 mb-1">{title}</h4>
      <p className="text-sm text-rose-400/80 max-w-xs">{desc}</p>
    </div>
  )
}

function ScoreRing({ score, label, color = '#22C55E' }: { score: number; label: string; color?: string }) {
  const radius = 28; const circ = 2 * Math.PI * radius
  const dash = (score / 100) * circ
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-18 h-18">
        <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
          <circle cx="36" cy="36" r={radius} strokeWidth="6" fill="none" stroke="#F3F4F6" />
          <circle cx="36" cy="36" r={radius} strokeWidth="6" fill="none" stroke={color}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{score}</span>
        </div>
      </div>
      <p className="text-[10px] font-bold text-nexora-mediumgray text-center mt-1 uppercase tracking-wide leading-tight max-w-[70px]">{label}</p>
    </div>
  )
}

// ─── Tab Components ──────────────────────────────────────

function OverviewTab({ report }: { report: Report }) {
  const rev = report.revenue_intelligence
  const overview = report.overview
  const aiSummary = report.ai_summary

  const fundingData = (rev?.funding_rounds ?? []).map((r: any, i: number) => ({
    name: r.round_type || `Round ${i + 1}`,
    amount: r.amount_usd ? r.amount_usd / 1e6 : 0,
    year: r.date?.substring(0, 4) || '?',
  }))

  const businessModelItems = report.business_model?.revenue_streams ?? []

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      {aiSummary?.executive_summary && (
        <div className="glass-container glass-green-border rounded-3xl p-7">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-nexora-emerald" /> Executive Summary
          </h3>
          <p className="text-sm text-nexora-mediumgray leading-relaxed">{aiSummary.executive_summary}</p>
          {aiSummary.one_liner && (
            <div className="mt-4 p-3 bg-nexora-emerald/5 border border-nexora-emerald/20 rounded-2xl text-sm font-semibold text-nexora-forest">
              💡 {aiSummary.one_liner}
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Funding Rounds chart */}
        <div className="glass-container glass-green-border rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-nexora-amber" /> Funding History
            </h3>
            {confidenceTag(rev?.revenue_confidence)}
          </div>
          {fundingData.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fundingData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={v => `$${v}M`} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    formatter={(v: any) => [`$${v}M`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#22C55E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center gap-2 text-center">
              <AlertTriangle className="w-8 h-8 text-nexora-amber/50" />
              <p className="text-xs text-nexora-mediumgray">No public funding data available for this company</p>
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-1">Total Funding</p>
              <p className="font-bold text-white">{fmtUSD(rev?.total_funding_usd)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-1">Valuation</p>
              <p className="font-bold text-white">{fmtUSD(rev?.valuation_usd)}</p>
            </div>
          </div>
        </div>

        {/* Business Model */}
        <div className="glass-container glass-green-border rounded-3xl p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-nexora-orange" /> Business Model
          </h3>
          {report.business_model?.summary ? (
            <p className="text-sm text-nexora-mediumgray leading-relaxed mb-5">{report.business_model.summary}</p>
          ) : null}
          {businessModelItems.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-3">Revenue Streams</p>
              <div className="space-y-2">
                {businessModelItems.map((stream: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl text-sm text-white font-medium">
                    <span className="w-2 h-2 rounded-full bg-nexora-emerald shrink-0" />
                    {stream}
                  </div>
                ))}
              </div>
            </div>
          )}
          {!report.business_model?.summary && businessModelItems.length === 0 && (
            <EmptyState title="No business model data" desc="Analysis didn't find specific business model information for this company." />
          )}
        </div>
      </div>

      {/* Quick Competitors Preview */}
      {(report.competitors ?? []).length > 0 && (
        <div className="glass-container glass-green-border rounded-3xl p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2">
            <Target className="w-4 h-4 text-nexora-orange" /> Top Competitors
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {report.competitors.slice(0, 4).map((comp: any, i: number) => (
              <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="font-bold text-white text-sm mb-1 truncate">{comp.name}</p>
                <p className="text-xs text-nexora-mediumgray truncate">{comp.overview?.substring(0, 60) ?? 'Competitor'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


function GrowthTab({ report }: { report: Report }) {
  const rev = report.revenue_intelligence
  return (
    <div className="glass-container glass-green-border rounded-3xl p-6">
      <h3 className="font-bold text-white mb-5 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-nexora-emerald" /> Growth Metrics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-2">YoY Growth</p>
          <p className="text-3xl font-bold text-white">{rev?.growth_rate_yoy != null ? `${rev.growth_rate_yoy.toFixed(1)}%` : "N/A"}</p>
        </div>
        <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-2">Estimated TAM</p>
          <p className="text-xl font-bold text-white">{report.market_analysis?.tam_usd ? `$${(report.market_analysis.tam_usd / 1e9).toFixed(1)}B` : "N/A"}</p>
        </div>
      </div>
    </div>
  )
}


function FinancialsTab({ report }: { report: Report }) {
  const rev = report.revenue_intelligence
  const isPublic = rev?.is_public

  const statsGrid = [
    { label: 'Annual Revenue', value: rev?.annual_revenue_display ?? fmtUSD(rev?.annual_revenue_usd), conf: rev?.revenue_confidence },
    { label: 'Total Funding', value: fmtUSD(rev?.total_funding_usd) },
    { label: 'Valuation', value: fmtUSD(rev?.valuation_usd) },
    { label: 'YoY Growth', value: rev?.growth_rate_yoy != null ? `${rev.growth_rate_yoy.toFixed(1)}%` : 'No public available information found' },
    { label: 'ARR', value: fmtUSD(rev?.arr) },
    { label: 'Market Cap', value: fmtUSD(rev?.market_cap_usd) },
    { label: 'Profitable', value: rev?.is_profitable == null ? 'Unknown' : rev.is_profitable ? 'Yes' : 'No' },
    { label: 'Stock Price', value: rev?.stock_price != null ? `$${rev.stock_price.toFixed(2)}` : 'No public available information found' },
  ]

  const fundingTimeline = (rev?.funding_rounds ?? []).map((r: any) => ({
    name: `${r.round_type}${r.date ? ` (${r.date.substring(0, 4)})` : ''}`,
    amount: r.amount_usd ? r.amount_usd / 1e6 : 0,
    valuation: r.valuation_usd ? r.valuation_usd / 1e9 : null,
    investors: r.investors ?? [],
  }))

  return (
    <div className="space-y-6">
      {!isPublic && (
        <div className="flex items-start gap-3 p-4 bg-nexora-amber/10 border border-nexora-amber/20 rounded-2xl">
          <Info className="w-4 h-4 text-nexora-gold shrink-0 mt-0.5" />
          <p className="text-sm text-white">
            <strong>Private company:</strong> Financial data is estimated from public sources. Values are labeled with confidence levels. No data is fabricated.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsGrid.map((stat, i) => (
          <div key={i} className="glass-container glass-green-border rounded-2xl p-5">
            <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            {'conf' in stat && stat.conf && <div className="mt-1">{confidenceTag(stat.conf)}</div>}
          </div>
        ))}
      </div>

      {/* Funding Timeline Chart */}
      {fundingTimeline.length > 0 && (
        <div className="glass-container glass-green-border rounded-3xl p-7">
          <h3 className="font-bold text-white mb-5">Funding Rounds Timeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundingTimeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={v => `$${v}M`} />
                <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} formatter={(v: any) => [`$${v}M`, 'Raised']} />
                <Bar dataKey="amount" fill="#22C55E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Investor lists */}
          <div className="mt-6 space-y-3">
            {fundingTimeline.filter((r: any) => r.investors.length > 0).map((round: any, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xs font-bold text-nexora-mediumgray pt-0.5 w-32 shrink-0">{round.name}</span>
                <div className="flex flex-wrap gap-1.5">
                  {round.investors.map((inv: string, j: number) => (
                    <span key={j} className="text-[11px] px-2.5 py-1 bg-white/5 rounded-full text-white font-medium border border-white/10">{inv}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {fundingTimeline.length === 0 && rev?.annual_revenue_usd == null && (
        <EmptyState title="Limited Financial Data" desc="No public financial data could be found for this company. This is common for small private companies." />
      )}

      {/* Visual Chart */}
      <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-nexora-emerald" /> Revenue vs Funding Comparison</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-nexora-mediumgray mb-1">
              <span>Annual Revenue</span>
              <span className="text-white font-bold">{fmtUSD(rev?.annual_revenue_usd) || "N/A"}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-nexora-emerald h-2 rounded-full" style={{ width: rev?.annual_revenue_usd ? "70%" : "0%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-nexora-mediumgray mb-1">
              <span>Total Funding</span>
              <span className="text-white font-bold">{fmtUSD(rev?.total_funding_usd) || "N/A"}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-nexora-blue h-2 rounded-full" style={{ width: rev?.total_funding_usd ? "45%" : "0%" }}></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

function CompetitorsTab({ report }: { report: Report }) {
  const competitors: any[] = report.competitors ?? []

  const radarData = competitors.slice(0, 5).map((c: any) => ({
    name: c.name,
    strength: c.advantages?.length ?? 2,
  }))

  const narrative = report.competitor_narrative

  if (competitors.length === 0) {
    return <ErrorState title="Analysis Failed" desc="The AI could not confidently identify competitors. The request may have timed out or data was insufficient." />
  }

  return (
    <div className="space-y-6">
      {narrative?.summary && (
        <div className="glass-container glass-green-border rounded-3xl p-7 flex flex-col xl:flex-row gap-8 items-center">
          <div className="flex-1">
            <h3 className="font-bold text-white mb-3">Competitive Landscape</h3>
            <p className="text-sm text-nexora-mediumgray leading-relaxed">{narrative.summary}</p>
            {narrative.moat_analysis && (
              <div className="mt-4 p-4 bg-nexora-emerald/5 border border-nexora-emerald/20 rounded-2xl">
                <p className="text-xs font-bold text-nexora-forest uppercase tracking-wider mb-1">Competitive Moat</p>
                <p className="text-sm text-white">{narrative.moat_analysis}</p>
              </div>
            )}
          </div>
          {radarData.length > 2 && (
            <div className="w-full xl:w-[400px] h-[300px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Radar name="Strengths" dataKey="strength" stroke="#22C55E" fill="#22C55E" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {competitors.map((comp: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-container glass-green-border rounded-3xl p-6 hover:border-nexora-emerald/30 hover:shadow-premium-hover transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-white">{comp.name}</h4>
                {comp.website && (
                  <a href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`} target="_blank" rel="noreferrer"
                    className="text-xs text-nexora-emerald hover:underline flex items-center gap-1 mt-0.5">
                    {comp.website} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              {comp.founded_year && <span className="text-xs font-bold text-nexora-mediumgray bg-white/5 px-2 py-1 rounded-full">Est. {comp.founded_year}</span>}
            </div>

            {comp.overview && <p className="text-xs text-nexora-mediumgray leading-relaxed mb-4">{comp.overview}</p>}

            {comp.advantages?.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-bold text-nexora-emerald uppercase tracking-wider mb-2">Strengths</p>
                <ul className="space-y-1">
                  {comp.advantages.slice(0, 3).map((a: string, j: number) => (
                    <li key={j} className="text-xs text-white flex items-start gap-1.5">
                      <CheckCircle className="w-3 h-3 text-nexora-emerald shrink-0 mt-0.5" />{a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {comp.weaknesses?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-nexora-orange uppercase tracking-wider mb-2">Weaknesses</p>
                <ul className="space-y-1">
                  {comp.weaknesses.slice(0, 3).map((w: string, j: number) => (
                    <li key={j} className="text-xs text-white flex items-start gap-1.5">
                      <XCircle className="w-3 h-3 text-nexora-orange shrink-0 mt-0.5" />{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              {comp.employee_count && <div><p className="text-[10px] text-nexora-mediumgray font-bold uppercase">Employees</p><p className="text-sm font-bold text-white">{comp.employee_count}</p></div>}
              {comp.revenue_display && <div><p className="text-[10px] text-nexora-mediumgray font-bold uppercase">Revenue</p><p className="text-sm font-bold text-white">{comp.revenue_display}</p></div>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SWOTTab({ report }: { report: Report }) {
  const swot = report.market_analysis?.swot

  const categories = [
    { key: 'strengths', label: 'Strengths', icon: CheckCircle, color: 'nexora-emerald', bg: 'nexora-emerald/10', items: swot?.strengths ?? [] },
    { key: 'weaknesses', label: 'Weaknesses', icon: XCircle, color: 'nexora-orange', bg: 'nexora-orange/10', items: swot?.weaknesses ?? [] },
    { key: 'opportunities', label: 'Opportunities', icon: TrendingUp, color: 'nexora-gold', bg: 'nexora-amber/10', items: swot?.opportunities ?? [] },
    { key: 'threats', label: 'Threats', icon: AlertCircle, color: 'rose-500', bg: 'rose-100', items: swot?.threats ?? [] },
  ]

  const hasData = categories.some(c => c.items.length > 0)
  if (!hasData) return <ErrorState title="SWOT Generation Failed" desc="SWOT analysis couldn't be generated for this company due to insufficient data or an AI timeout." />

  return (
    <div className="space-y-6">
      {report.market_analysis?.market_position && (
        <div className="glass-container glass-green-border rounded-3xl p-6">
          <h3 className="font-bold text-white mb-2">Market Position</h3>
          <p className="text-sm text-nexora-mediumgray">{report.market_analysis.market_position}</p>
          {report.market_analysis.market_size_usd && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-bold text-nexora-mediumgray uppercase tracking-wider">Market Size:</span>
              <span className="text-sm font-bold text-white">{report.market_analysis.market_size_usd}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <div key={cat.key} className={`bg-${cat.bg} rounded-3xl p-6 border border-white/10`}>
              <div className="flex items-center gap-2 mb-5">
                <Icon className={`w-5 h-5 text-${cat.color}`} />
                <h3 className={`font-bold text-${cat.color} text-lg font-syne`}>{cat.label}</h3>
                <span className="ml-auto text-xs font-bold text-nexora-mediumgray">{cat.items.length}</span>
              </div>
              {cat.items.length > 0 ? (
                <ul className="space-y-2.5">
                  {cat.items.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white">
                      <ChevronRight className={`w-3.5 h-3.5 text-${cat.color} shrink-0 mt-0.5`} />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-nexora-mediumgray">No data available</p>
              )}
            </div>
          )
        })}
      </div>

      {report.market_analysis?.key_differentiators?.length > 0 && (
        <div className="glass-container glass-green-border rounded-3xl p-6">
          <h3 className="font-bold text-white mb-4">Key Differentiators</h3>
          <div className="flex flex-wrap gap-2">
            {report.market_analysis.key_differentiators.map((d: string, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-nexora-emerald/10 text-nexora-forest text-sm font-semibold rounded-full">{d}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TechTab({ report }: { report: Report }) {
  const tech = report.tech_stack
  const sections = [
    { label: 'Frontend', items: tech?.frontend ?? [], color: 'nexora-emerald' },
    { label: 'Backend', items: tech?.backend ?? [], color: 'nexora-orange' },
    { label: 'Cloud', items: tech?.cloud_providers ?? [], color: 'nexora-amber' },
    { label: 'Databases', items: tech?.databases ?? [], color: 'nexora-forest' },
    { label: 'AI & ML', items: tech?.ai_ml ?? [], color: 'nexora-emerald' },
    { label: 'Analytics', items: tech?.analytics ?? [], color: 'nexora-orange' },
    { label: 'Authentication', items: tech?.authentication ?? [], color: 'nexora-amber' },
    { label: 'APIs', items: tech?.apis ?? [], color: 'nexora-forest' },
    { label: 'Payment', items: tech?.payment_providers ?? [], color: 'nexora-emerald' },
    { label: 'CDN', items: tech?.cdn ?? [], color: 'nexora-orange' },
  ].filter(s => s.items.length > 0)

  if (sections.length === 0) return <ErrorState title="Detection Failed" desc="Technology stack couldn't be detected for this company. The AI may have timed out." />

  return (
    <div className="space-y-5">
      <div className="glass-container glass-green-border rounded-3xl p-6">
        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-nexora-emerald" /> Technology Stack
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className={`text-[10px] font-bold uppercase tracking-widest text-${section.color} mb-3`}>{section.label}</p>
              <div className="flex flex-wrap gap-2">
                {section.items.map((tech: string, j: number) => (
                  <span key={j} className="text-xs font-semibold px-2.5 py-1 bg-white rounded-full text-white border border-white/10 shadow-sm">{tech}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NewsTab({ report }: { report: Report }) {
  const news: any[] = report.recent_news ?? []
  if (news.length === 0) return <EmptyState title="No Recent News" desc="No recent news articles were found for this company." />

  const sentimentColor: Record<string, string> = {
    positive: 'text-nexora-emerald bg-nexora-emerald/10',
    negative: 'text-rose-600 bg-rose-100',
    neutral: 'text-nexora-mediumgray bg-white/5',
  }

  return (
    <div className="space-y-4">
      {news.map((item: any, i: number) => (
        <motion.a
          key={i}
          href={item.url}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-start gap-5 glass-container glass-green-border rounded-3xl p-6 hover:border-nexora-emerald/30 hover:shadow-premium-hover transition-all group"
        >
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-nexora-emerald/10 transition-colors">
            <Newspaper className="w-5 h-5 text-nexora-mediumgray group-hover:text-nexora-emerald transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <h4 className="font-bold text-white text-sm group-hover:text-nexora-emerald transition-colors leading-tight">{item.title}</h4>
              <ArrowUpRight className="w-4 h-4 text-nexora-mediumgray shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {item.summary && <p className="text-xs text-nexora-mediumgray leading-relaxed mb-2 line-clamp-2">{item.summary}</p>}
            <div className="flex items-center gap-3">
              {item.source && <span className="text-[10px] font-bold text-nexora-mediumgray uppercase">{item.source}</span>}
              {item.published_at && (
                <span className="text-[10px] text-nexora-mediumgray flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />{item.published_at}
                </span>
              )}
              {item.sentiment && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${sentimentColor[item.sentiment] ?? 'text-nexora-mediumgray bg-white/5'}`}>
                  {item.sentiment}
                </span>
              )}
            </div>
          </div>
        </motion.a>
      ))}
    </div>
  )
}

function TimelineTab({ report }: { report: Report }) {
  const milestones: any[] = report.milestones ?? []
  if (milestones.length === 0) return <ErrorState title="Timeline Generation Failed" desc="Company milestones couldn't be extracted from available sources. The AI request may have timed out." />

  const typeColor: Record<string, string> = {
    founding: 'bg-nexora-emerald text-white',
    funding: 'bg-nexora-amber text-white',
    product: 'bg-nexora-emerald text-white',
    acquisition: 'bg-nexora-orange text-white',
    ipo: 'bg-nexora-gold text-white',
    expansion: 'bg-nexora-forest text-white',
    partnership: 'bg-nexora-orange text-white',
    other: 'bg-nexora-lightgray text-white',
  }

  return (
    <div className="glass-container glass-green-border rounded-3xl p-7">
      <h3 className="font-bold text-white mb-8 flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-nexora-emerald" /> Company Timeline
      </h3>
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-white/5" />
        <div className="space-y-6">
          {milestones.map((m: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-5 relative"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-bold ${typeColor[m.milestone_type] ?? typeColor.other}`}>
                {m.year}
              </div>
              <div className="bg-white/5 rounded-2xl p-4 flex-1 border border-white/10">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white text-sm">{m.title}</h4>
                  <span className="text-[10px] text-nexora-mediumgray font-bold uppercase shrink-0">{m.milestone_type}</span>
                </div>
                {m.description && <p className="text-xs text-nexora-mediumgray mt-1 leading-relaxed">{m.description}</p>}
                {m.amount_usd && <p className="text-xs font-bold text-nexora-emerald mt-1">{fmtUSD(m.amount_usd)}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AIInsightsTab({ report }: { report: Report }) {
  const scores = report.ai_summary?.scores ?? {}
  const scoreEntries = [
    { key: 'business_health', label: 'Business Health', color: '#22C55E' },
    { key: 'innovation', label: 'Innovation', color: '#FBBF24' },
    { key: 'ai_readiness', label: 'AI Readiness', color: '#F97316' },
    { key: 'growth_potential', label: 'Growth Potential', color: '#22C55E' },
    { key: 'digital_maturity', label: 'Digital Maturity', color: '#166534' },
    { key: 'operational_maturity', label: 'Operational', color: '#F97316' },
    { key: 'customer_trust', label: 'Customer Trust', color: '#FBBF24' },
    { key: 'investment_risk', label: 'Risk', color: '#EF4444' },
  ]

  const radarData = scoreEntries.filter(s => scores[s.key] > 0).map(s => ({
    subject: s.label,
    value: s.key === 'investment_risk' ? 100 - scores[s.key] : scores[s.key],
  }))

  const recs: any[] = report.strategic_recommendations ?? []

  const priorityColor: Record<string, string> = {
    critical: 'bg-rose-100 text-rose-600',
    high: 'bg-nexora-orange/10 text-nexora-orange',
    medium: 'bg-nexora-amber/10 text-nexora-gold',
    low: 'bg-nexora-emerald/10 text-nexora-emerald',
  }

  return (
    <div className="space-y-6">
      {/* Scores */}
      <div className="glass-container glass-green-border rounded-3xl p-7">
        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
          <Brain className="w-4 h-4 text-nexora-emerald" /> AI Intelligence Scores
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {scoreEntries.map(s => (
            <ScoreRing key={s.key} score={scores[s.key] ?? 0} label={s.label} color={s.color} />
          ))}
        </div>

        {radarData.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#F3F4F6" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="#22C55E" fill="#22C55E" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Future opportunities & key risks */}
      <div className="grid md:grid-cols-2 gap-6">
        {(report.ai_summary?.future_opportunities ?? []).length > 0 && (
          <div className="bg-nexora-emerald/5 rounded-3xl p-6 border border-nexora-emerald/20">
            <h3 className="font-bold text-nexora-forest mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Future Opportunities
            </h3>
            <ul className="space-y-2.5">
              {report.ai_summary.future_opportunities.map((o: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white">
                  <ChevronRight className="w-3.5 h-3.5 text-nexora-emerald shrink-0 mt-0.5" />{o}
                </li>
              ))}
            </ul>
          </div>
        )}
        {(report.ai_summary?.key_risks ?? []).length > 0 && (
          <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100">
            <h3 className="font-bold text-rose-700 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Key Risks
            </h3>
            <ul className="space-y-2.5">
              {report.ai_summary.key_risks.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white">
                  <ChevronRight className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />{r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Strategic Recommendations */}
      {recs.length > 0 && (
        <div className="glass-container glass-green-border rounded-3xl p-7">
          <h3 className="font-bold text-white mb-5">Strategic Recommendations</h3>
          <div className="space-y-4">
            {recs.map((rec: any, i: number) => (
              <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-sm">{rec.title}</h4>
                  <div className="flex items-center gap-2">
                    {rec.timeframe && <span className="text-[10px] text-nexora-mediumgray font-bold">{rec.timeframe}</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${priorityColor[rec.priority] ?? 'bg-white/5 text-nexora-mediumgray'}`}>{rec.priority}</span>
                  </div>
                </div>
                <p className="text-xs text-nexora-mediumgray leading-relaxed">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.ai_summary?.investment_thesis && (
        <div className="bg-nexora-charcoal rounded-3xl p-7">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-nexora-emerald" /> Investment Thesis
          </h3>
          <p className="text-sm text-nexora-mediumgray leading-relaxed">{report.ai_summary.investment_thesis}</p>
        </div>
      )}
    </div>
  )
}

function GeographyTab({ report }: { report: Report }) {
  const geo = report.geographic_presence
  if (!geo || (!geo.headquarters_country && geo.countries_present?.length === 0)) {
    return <EmptyState title="No Geographic Data" desc="Geographic presence data couldn't be determined for this company." />
  }

  return (
    <div className="space-y-5">
      <div className="glass-container glass-green-border rounded-3xl p-7">
        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
          <Map className="w-4 h-4 text-nexora-emerald" /> Geographic Presence
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {geo.headquarters_country && (
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-1">HQ Country</p>
              <p className="font-bold text-white">{geo.headquarters_country}</p>
            </div>
          )}
          {geo.headquarters_city && (
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-1">HQ City</p>
              <p className="font-bold text-white">{geo.headquarters_city}</p>
            </div>
          )}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-1">Countries</p>
            <p className="font-bold text-white">{geo.countries_present?.length ?? 0}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-1">Global</p>
            <p className="font-bold text-white">{geo.has_global_presence ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {geo.countries_present?.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-3">Countries of Operation</p>
            <div className="flex flex-wrap gap-2">
              {geo.countries_present.map((c: string, i: number) => (
                <span key={i} className="text-sm px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-white font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {geo.key_markets?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-3">Key Markets</p>
            <div className="flex flex-wrap gap-2">
              {geo.key_markets.map((m: string, i: number) => (
                <span key={i} className="text-sm px-3 py-1.5 bg-nexora-emerald/10 rounded-full border border-nexora-emerald/20 text-nexora-forest font-semibold">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {geo.expansion_trajectory && (
          <div className="mt-5 p-4 bg-nexora-emerald/5 rounded-2xl border border-nexora-emerald/20">
            <p className="text-xs font-bold text-nexora-forest uppercase tracking-wider mb-1">Expansion Trajectory</p>
            <p className="text-sm text-white">{geo.expansion_trajectory}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────

const TABS = [
  { id: "overview", label: "Details", icon: BarChart3 },
  { id: "financials", label: "Financials", icon: DollarSign },
  { id: "competitors", label: "Competitors", icon: Target },
  { id: "growth", label: "Growth", icon: TrendingUp },
]

import { Shield } from 'lucide-react'

export default function ReportDashboard() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [report, setReport] = useState<Report>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await api.getReport(id)
        setReport(data)
      } catch {
        try {
          const status = await api.getJobStatus(id)
          if (status.status !== 'completed') router.push('/')
          else {
            // completed but report_id might differ
            if (status.report_id) {
              const data = await api.getReport(status.report_id)
              setReport(data)
            } else setError('Report not found.')
          }
        } catch {
          setError('Report not found or still processing.')
        }
      }
    }
    loadReport()
  }, [id, router])

  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 bg-rose-100 rounded-3xl flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-rose-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Report Not Found</h2>
      <p className="text-nexora-mediumgray mb-4">{error}</p>
      <button onClick={() => router.push('/')} className="px-6 py-3 bg-nexora-emerald text-white rounded-full font-bold hover:bg-nexora-forest transition-colors">
        Go Home
      </button>
    </div>
  )

  if (!report) return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <img src="/owl.png" alt="Loading" className="w-full h-full object-contain animate-float" />
        </div>
        <p className="text-nexora-mediumgray font-semibold animate-pulse">Loading report...</p>
      </div>
    </div>
  )

  const rev = report.revenue_intelligence
  const scores = report.ai_summary?.scores ?? {}

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-8"
    >
      {/* ── Report Header ── */}
      <div className="glass-container glass-green-border rounded-3xl p-6 shadow-glass mb-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Company identity */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-sm overflow-hidden">
              {report.overview?.logo_url ? (
                <img src={report.overview.logo_url} alt={report.company_name} className="w-full h-full object-contain p-2" />
              ) : (
                <span className="text-2xl font-syne font-bold text-white">
                  {report.company_name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-syne font-bold text-white tracking-tight">{report.company_name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-nexora-mediumgray font-medium">
                {report.overview?.industry && (
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{report.overview.industry}</span>
                )}
                {report.overview?.headquarters && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{report.overview.headquarters}</span>
                )}
                {report.overview?.founded_year && (
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Est. {report.overview.founded_year}</span>
                )}
                {report.website && (
                  <a href={report.website.startsWith('http') ? report.website : `https://${report.website}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-nexora-emerald hover:underline">
                    <Globe className="w-3.5 h-3.5" />{report.website}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons + key stats */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full text-sm font-bold text-white hover:bg-white/10/5 transition-colors">
                <Bookmark className="w-4 h-4" /> Save
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full text-sm font-bold text-white hover:bg-white/10/5 transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <a
                href={`/api/report/${id}/export/pdf`}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white shadow-glass rounded-full text-sm font-bold hover:bg-nexora-emerald transition-colors"
              >
                <Download className="w-4 h-4" /> Export
              </a>
            </div>

            <div className="flex items-center gap-5 pl-4 border-l border-white/20">
              <div>
                <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider">Revenue</p>
                <p className="text-base font-bold text-white truncate w-32" title={rev?.annual_revenue_display ?? fmtUSD(rev?.annual_revenue_usd)}>{rev?.annual_revenue_display ?? fmtUSD(rev?.annual_revenue_usd)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider">Funding</p>
                <p className="text-base font-bold text-white truncate w-32" title={fmtUSD(rev?.total_funding_usd)}>{fmtUSD(rev?.total_funding_usd)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider">Competitors</p>
                <p className="text-base font-bold text-white">{report.competitors?.length ?? 0}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider">AI Health</p>
                <p className="text-base font-bold text-nexora-emerald">{scores.business_health ?? '—'}<span className="text-xs text-nexora-mediumgray font-normal">/100</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar mb-6 pb-1">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-2xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-glass shadow-sm'
                  : 'text-nexora-mediumgray hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.id}
            </button>
          )
        })}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab report={report} />}
          {activeTab === 'financials' && <FinancialsTab report={report} />}
          {activeTab === 'competitors' && <CompetitorsTab report={report} />}
          {activeTab === 'growth' && <GrowthTab report={report} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
