import axios from 'axios'

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Types
export interface ReportListItem {
  id: string
  company_name: string
  website: string | null
  generated_at: string
  generation_time_seconds: number
  sources_used: string[]
  models_used: string[]
  one_liner: string | null
}

export interface ResearchResponse {
  job_id: string
  status: string
}

export interface ProgressEvent {
  job_id: string
  step: string
  message: string
  progress: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  timestamp: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources: { source: string; url: string; confidence: string }[]
  model_used?: string
  timestamp: string
}

export interface ChatResponse {
  session_id: string
  answer: string
  sources: any[]
  message_count: number
  model_used?: string
}

// Full Report Types
export interface CompanyReport {
  id: string
  company_name: string
  website: string | null
  overview: any
  business_model: any
  revenue_intelligence: any
  products: any[]
  tech_stack: any
  market_analysis: any
  competitors: any[]
  milestones: any[]
  feature_matrix: any[]
  competitor_narrative: any
  geographic_presence: any
  strategic_recommendations: any[]
  recent_news: any[]
  github: any
  ai_summary: any
  sources_used: string[]
  models_used: string[]
}

// API Methods
export default {
  // Research
  startResearch: async (payload: { company_name?: string; website?: string }): Promise<ResearchResponse> => {
    const res = await api.post('/research', payload)
    return res.data
  },
  
  getJobStatus: async (jobId: string): Promise<any> => {
    const res = await api.get(`/research/${jobId}`)
    return res.data
  },

  // Reports
  listReports: async (): Promise<ReportListItem[]> => {
    const res = await api.get('/reports')
    return res.data
  },

  getReport: async (reportId: string): Promise<CompanyReport> => {
    const res = await api.get(`/report/${reportId}`)
    return res.data
  },

  deleteReport: async (reportId: string): Promise<void> => {
    await api.delete(`/report/${reportId}`)
  },

  exportJsonUrl: (reportId: string) => `${API_BASE}/report/${reportId}/export/json`,
  exportPdfUrl: (reportId: string) => `${API_BASE}/report/${reportId}/export/pdf`,

  // Chat
  sendChatMessage: async (reportId: string, message: string, sessionId?: string): Promise<ChatResponse> => {
    const res = await api.post(`/chat/${reportId}`, { message, session_id: sessionId })
    return res.data
  },
  
  getChatHistory: async (reportId: string, sessionId?: string): Promise<any> => {
    const res = await api.get(`/chat/${reportId}/history`, { params: { session_id: sessionId } })
    return res.data
  }
}

// Also export individual functions for backward compatibility if needed in the massive file
export const startResearch = (payload: any) => api.post('/research', payload).then(r => r.data)
export const getJobStatus = (id: string) => api.get(`/research/${id}`).then(r => r.data)
export const getReport = (id: string) => api.get(`/report/${id}`).then(r => r.data)
