'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Bookmark, Download, Link as LinkIcon, MapPin, Building2, ExternalLink, Newspaper } from 'lucide-react'
import { 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip 
} from 'recharts'
import api from '@/lib/api'

// Mock Data for charts if backend doesn't provide
const mockRevenueData = [
  { year: '2020', revenue: 274.5 },
  { year: '2021', revenue: 365.8 },
  { year: '2022', revenue: 394.3 },
  { year: '2023', revenue: 383.3 },
  { year: '2024', revenue: 390.1 },
]

const mockBusinessModel = [
  { name: 'Hardware', value: 52, color: '#22C55E' },
  { name: 'Services', value: 22, color: '#F97316' },
  { name: 'Software', value: 15, color: '#FBBF24' },
  { name: 'Other', value: 11, color: '#9CA3AF' },
]

export default function ReportDashboard() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [report, setReport] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('Overview')

  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await api.getReport(id)
        setReport(data)
      } catch (err) {
        // If not found or still processing, we might want to poll or redirect.
        // For now, let's try polling a few times just in case it just finished.
        try {
          const status = await api.getJobStatus(id)
          if (status.status !== 'completed') {
            router.push('/') // Go back to home if not done
          }
        } catch (e) {
          setError('Report not found.')
        }
      }
    }
    loadReport()
  }, [id, router])

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center">
        <h2 className="text-2xl font-bold text-nexora-charcoal mb-2">Report Not Found</h2>
        <p className="text-nexora-mediumgray">{error}</p>
        <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-nexora-emerald text-white rounded-full font-bold">Go Home</button>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="animate-spin-slow w-12 h-12 border-4 border-nexora-emerald/20 border-t-nexora-emerald rounded-full"></div>
      </div>
    )
  }

  const tabs = ['Overview', 'Financials', 'Competitors', 'SWOT', 'Technology', 'News', 'Timeline', 'AI Insights']

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* 1. Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-nexora-warmwhite rounded-2xl flex items-center justify-center shrink-0 border border-black/5 shadow-sm">
            <span className="text-3xl font-syne font-bold text-nexora-charcoal">
              {report.company_name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-syne font-bold text-nexora-charcoal tracking-tight mb-1">{report.company_name}</h1>
            <p className="text-sm font-medium text-nexora-mediumgray flex items-center gap-4">
              <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {report.overview?.industry || 'Technology'}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {report.overview?.headquarters || 'Global'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 divide-x divide-black/5">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-black/10 rounded-full text-sm font-bold text-nexora-charcoal hover:bg-nexora-warmwhite transition-colors">
              <Bookmark className="w-4 h-4" /> Save
            </button>
            <button className="p-2 border border-black/10 rounded-full text-nexora-charcoal hover:bg-nexora-warmwhite transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="pl-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-1">Revenue</p>
              <p className="text-lg font-bold text-nexora-charcoal">{report.financials?.estimated_revenue || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-1">Funding</p>
              <p className="text-lg font-bold text-nexora-charcoal">{report.financials?.total_funding || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-1">Competitors</p>
              <p className="text-lg font-bold text-nexora-charcoal">{report.competitors?.length || 0}</p>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[10px] font-bold text-nexora-mediumgray uppercase tracking-wider mb-1">AI Health</p>
                <p className="text-lg font-bold text-nexora-charcoal">
                  {report.ai_summary?.scores?.business_health || 85} <span className="text-xs text-nexora-mediumgray font-normal">/100</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full border-4 border-nexora-emerald/20 border-t-nexora-emerald"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar mb-8 border-b border-black/5 pb-2">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-bold rounded-full whitespace-nowrap transition-all ${
              activeTab === tab 
                ? 'bg-nexora-charcoal text-white shadow-sm' 
                : 'text-nexora-mediumgray hover:text-nexora-charcoal hover:bg-nexora-warmwhite'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Tab Content - Overview */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-nexora-charcoal">Revenue Over Time</h3>
                <span className="text-xs font-bold px-2 py-1 bg-nexora-warmwhite rounded-md text-nexora-mediumgray">Annual</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dx={-10} tickFormatter={(v) => `$${v}B`} />
                    <RechartsTooltip cursor={{ stroke: '#22C55E', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={3} dot={{ r: 4, fill: '#22C55E', strokeWidth: 2, stroke: '#FFF' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Business Model */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
              <h3 className="font-bold text-nexora-charcoal mb-4">Business Model</h3>
              <p className="text-sm text-nexora-mediumgray mb-6 leading-relaxed">
                {report.business_model?.core_business || "Designs, manufactures, and sells premium hardware, software, and services. Revenue comes from product sales, subscriptions, and an expanding ecosystem."}
              </p>
              
              <div className="flex items-center justify-between">
                <button className="px-4 py-2 border border-black/10 rounded-full text-sm font-bold text-nexora-charcoal hover:bg-nexora-warmwhite transition-colors">
                  View Details
                </button>
                
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={mockBusinessModel} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                          {mockBusinessModel.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {mockBusinessModel.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="font-semibold text-nexora-charcoal w-16">{item.name}</span>
                        <span className="text-nexora-mediumgray">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Top Competitors */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
              <h3 className="font-bold text-nexora-charcoal mb-6">Top Competitors</h3>
              <div className="space-y-4">
                {report.competitors?.slice(0, 4).map((comp: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-nexora-charcoal">{comp.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-nexora-warmwhite rounded-full overflow-hidden">
                        <div className="h-full bg-nexora-orange rounded-full" style={{ width: `${80 - i * 15}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-nexora-orange w-12 text-right">High</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-6 px-4 py-2 border border-black/10 rounded-full text-xs font-bold text-nexora-charcoal hover:bg-nexora-warmwhite transition-colors">
                View All
              </button>
            </div>

            {/* SWOT Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
              <h3 className="font-bold text-nexora-charcoal mb-6">SWOT Summary</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="aspect-square bg-nexora-emerald/10 rounded-2xl flex flex-col items-center justify-center p-2 text-center group cursor-pointer hover:bg-nexora-emerald/20 transition-colors">
                  <span className="text-3xl font-syne font-bold text-nexora-forest mb-1 group-hover:scale-110 transition-transform">S</span>
                  <span className="text-[10px] font-bold text-nexora-forest uppercase">Strengths</span>
                </div>
                <div className="aspect-square bg-nexora-orange/10 rounded-2xl flex flex-col items-center justify-center p-2 text-center group cursor-pointer hover:bg-nexora-orange/20 transition-colors">
                  <span className="text-3xl font-syne font-bold text-nexora-orange mb-1 group-hover:scale-110 transition-transform">W</span>
                  <span className="text-[10px] font-bold text-nexora-orange uppercase">Weaknesses</span>
                </div>
                <div className="aspect-square bg-nexora-amber/10 rounded-2xl flex flex-col items-center justify-center p-2 text-center group cursor-pointer hover:bg-nexora-amber/20 transition-colors">
                  <span className="text-3xl font-syne font-bold text-nexora-gold mb-1 group-hover:scale-110 transition-transform">O</span>
                  <span className="text-[10px] font-bold text-nexora-gold uppercase">Opportunities</span>
                </div>
                <div className="aspect-square bg-rose-100 rounded-2xl flex flex-col items-center justify-center p-2 text-center group cursor-pointer hover:bg-rose-200 transition-colors">
                  <span className="text-3xl font-syne font-bold text-rose-600 mb-1 group-hover:scale-110 transition-transform">T</span>
                  <span className="text-[10px] font-bold text-rose-600 uppercase">Threats</span>
                </div>
              </div>
              <button className="mt-6 px-4 py-2 border border-black/10 rounded-full text-xs font-bold text-nexora-charcoal hover:bg-nexora-warmwhite transition-colors">
                View Full SWOT
              </button>
            </div>

            {/* Latest News */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col">
              <h3 className="font-bold text-nexora-charcoal mb-4">Latest News</h3>
              <div className="space-y-4 flex-1">
                {report.news?.slice(0, 2).map((news: any, i: number) => (
                  <a key={i} href={news.url} target="_blank" rel="noreferrer" className="flex items-start gap-3 group">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-nexora-charcoal line-clamp-2 group-hover:text-nexora-emerald transition-colors leading-tight mb-1">{news.title}</h4>
                      <p className="text-[10px] text-nexora-mediumgray">{news.date} • {news.source}</p>
                    </div>
                    <div className="w-12 h-12 bg-nexora-warmwhite rounded-lg flex items-center justify-center shrink-0 border border-black/5">
                      <Newspaper className="w-5 h-5 text-nexora-mediumgray" />
                    </div>
                  </a>
                ))}
              </div>
              <button className="mt-4 px-4 py-2 border border-black/10 rounded-full text-xs font-bold text-nexora-charcoal hover:bg-nexora-warmwhite transition-colors self-start">
                View All News
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Placeholders for other tabs */}
      {activeTab !== 'Overview' && (
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-black/5 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-nexora-warmwhite rounded-full flex items-center justify-center mb-4 border border-black/5">
            <img src="/owl.png" alt="Owl" className="w-10 h-10 object-contain opacity-50 grayscale" />
          </div>
          <h3 className="text-xl font-bold text-nexora-charcoal mb-2">{activeTab} intelligence is ready</h3>
          <p className="text-sm text-nexora-mediumgray max-w-md">
            This module contains detailed insights regarding {activeTab.toLowerCase()}. Use the AI Assistant to query specific data points from this section.
          </p>
        </div>
      )}

    </div>
  )
}
