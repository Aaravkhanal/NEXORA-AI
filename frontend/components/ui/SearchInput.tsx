'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Globe, ArrowRight, Loader2, Paperclip } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import api from '@/lib/api'

interface SearchInputProps {
  className?: string
  autoFocus?: boolean
  large?: boolean
}

export function SearchInput({ className = '', autoFocus = false, large = false }: SearchInputProps) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Progress Overlay State
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [progressMsg, setProgressMsg] = useState('Searching...')
  const [progressValue, setProgressValue] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true)
  }, [])

  // Simple heuristic: if it contains a dot and no spaces, treat as URL
  const isUrl = input.trim().length > 3 && input.includes('.') && !input.includes(' ')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const payload = isUrl ? { website: input } : { company_name: input }
      const response = await api.startResearch(payload)
      setActiveJobId(response.job_id)
      setProgressValue(10)
      setProgressMsg('Collecting Company Data...')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start research.')
      setIsLoading(false)
    }
  }

  // Poll progress if activeJobId is set
  useEffect(() => {
    if (!activeJobId) return

    let isPolling = true

    const poll = async () => {
      if (!isPolling) return
      
      try {
        const status = await api.getJobStatus(activeJobId)
        if (status.progress > progressValue) {
          setProgressValue(status.progress)
          setProgressMsg(status.current_step)
        }
        
        if (status.status === 'completed' && status.report_id) {
          isPolling = false
          setProgressValue(100)
          setProgressMsg('Finalizing dashboard...')
          
          try {
            const history = JSON.parse(localStorage.getItem('recent_searches') || '[]')
            const entry = { id: status.report_id, name: input, date: new Date().toISOString() }
            const filtered = history.filter((h: any) => h.name.toLowerCase() !== input.toLowerCase())
            localStorage.setItem('recent_searches', JSON.stringify([entry, ...filtered].slice(0, 10)))
          } catch (e) {}
          setTimeout(() => {
            router.push(`/report/${status.report_id}`)
            setTimeout(() => {
              setActiveJobId(null)
              setIsLoading(false)
            }, 1000)
          }, 500)
          return
        } else if (status.status === 'failed') {
          isPolling = false
          setError(status.error || 'Research failed')
          setActiveJobId(null)
          setIsLoading(false)
          return
        }
      } catch (err) {
        console.error("Failed to poll status", err)
      }

      if (isPolling) {
        setTimeout(poll, 1000)
      }
    }

    poll()

    return () => { isPolling = false }
  }, [activeJobId, progressValue, router])

  return (
    <>
      <div className={`relative w-full ${className}`}>
        <form onSubmit={handleSubmit} className="relative group w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center gap-3">
            <button type="button" className="p-2 text-nexora-mediumgray hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full" title="Upload annual report">
              <Paperclip className={large ? 'w-5 h-5' : 'w-4 h-4'} />
            </button>
            <div className="w-px h-5 bg-white/10 hidden sm:block"></div>
          </div>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search company, paste URL, or ask a strategic question..."
            autoFocus={autoFocus}
            className={`w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white placeholder:text-nexora-mediumgray focus:outline-none focus:border-nexora-emerald focus:ring-[2px] focus:ring-nexora-emerald/20 transition-all shadow-glass ${
              large ? 'h-[64px] pl-20 pr-[72px] text-base' : 'h-[50px] pl-16 pr-14 text-sm'
            }`}
            disabled={isLoading}
          />
          
          <div className={`absolute right-2 top-2 bottom-2 flex items-center`}>
            {isLoading && !activeJobId ? (
               <div className="w-10 h-full flex items-center justify-center">
                 <Loader2 className={`animate-spin text-nexora-emerald ${large ? 'w-6 h-6' : 'w-5 h-5'}`} />
               </div>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`bg-nexora-emerald text-white rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:bg-white/10 disabled:text-white/40 ${
                  large ? 'w-12 h-full' : 'w-10 h-full'
                }`}
              >
                <ArrowRight className={large ? 'w-5 h-5' : 'w-4 h-4'} />
              </button>
            )}
          </div>
        </form>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center gap-2 z-10"
            >
              <span className="font-bold">Error:</span> {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Overlay Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {activeJobId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-md bg-nexora-charcoal p-8 rounded-3xl shadow-glass border border-white/10 text-center relative overflow-hidden"
              >
                {/* Animated Logo */}
                <div className="relative h-24 mb-6 flex items-center justify-center">
                  <motion.div 
                    animate={{ 
                      scale: [1, 0.6, 1], // Move front to back
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{ 
                      duration: 2.5,
                      ease: "easeInOut",
                      repeat: Infinity
                    }}
                  >
                    <img src="/logo.png" alt="Nexora Analyzing" className="w-16 h-16 object-contain animate-float" />
                  </motion.div>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">Analyzing {input}</h2>
                <div className="flex justify-between items-end mb-2 min-h-[20px]">
                  <p className="text-sm font-medium text-nexora-emerald">{progressMsg}</p>
                  <span className="text-xs font-bold text-white">{progressValue}%</span>
                </div>

                {/* Custom Progress Bar */}
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div 
                    className="h-full bg-nexora-emerald progress-bar-striped"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressValue}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
