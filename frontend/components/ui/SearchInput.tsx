'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Globe, ArrowRight, Loader2 } from 'lucide-react'
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
  const [progressMsg, setProgressMsg] = useState('Initializing AI agents...')
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
      setProgressMsg('Crawling public data sources...')
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
          <div className={`absolute left-0 top-0 bottom-0 flex items-center justify-center text-nexora-mediumgray transition-colors group-focus-within:text-nexora-emerald ${large ? 'w-16' : 'w-12'}`}>
            {isLoading && !activeJobId ? (
              <Loader2 className={`animate-spin ${large ? 'w-6 h-6' : 'w-5 h-5'}`} />
            ) : isUrl ? (
              <Globe className={large ? 'w-6 h-6' : 'w-4 h-4'} />
            ) : (
              <Search className={large ? 'w-6 h-6' : 'w-4 h-4'} />
            )}
          </div>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search for a company..."
            autoFocus={autoFocus}
            className={`w-full bg-white border border-black/5 rounded-2xl text-nexora-charcoal placeholder:text-nexora-mediumgray focus:outline-none focus:border-nexora-emerald focus:ring-[3px] focus:ring-nexora-emerald/20 transition-all shadow-premium hover:shadow-premium-hover ${
              large ? 'h-[60px] pl-16 pr-[72px] text-lg' : 'h-[48px] pl-12 pr-14 text-sm'
            }`}
            disabled={isLoading}
          />
          
          <div className={`absolute right-2 top-2 bottom-2 flex items-center gap-2`}>
            {!input.trim() && large && (
              <span className="hidden sm:flex text-xs font-bold text-nexora-mediumgray bg-black/5 border border-black/5 px-2 py-1 rounded items-center gap-1 shadow-sm">
                ⌘K
              </span>
            )}
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`bg-nexora-charcoal hover:bg-nexora-emerald text-white rounded-[14px] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                large ? 'w-12 h-full shadow-sm' : 'w-10 h-full'
              }`}
            >
              <ArrowRight className={large ? 'w-5 h-5' : 'w-4 h-4'} />
            </button>
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
              className="fixed inset-0 bg-white/80 backdrop-blur-md z-[9999] flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-md bg-white p-8 rounded-3xl shadow-glass border border-black/5 text-center relative overflow-hidden"
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

                <h2 className="text-xl font-bold text-nexora-charcoal mb-2">Analyzing {input}</h2>
                <div className="flex justify-between items-end mb-2 min-h-[20px]">
                  <p className="text-sm font-medium text-nexora-emerald">{progressMsg}</p>
                  <span className="text-xs font-bold text-nexora-charcoal">{progressValue}%</span>
                </div>

                {/* Custom Progress Bar */}
                <div className="w-full h-3 bg-nexora-warmwhite rounded-full overflow-hidden border border-black/5">
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
