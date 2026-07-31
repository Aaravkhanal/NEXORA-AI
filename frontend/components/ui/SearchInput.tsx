'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Globe, ArrowRight, Loader2, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
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
      router.push(`/report/${response.job_id}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start research.')
      setIsLoading(false)
    }
  }

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`absolute left-0 top-0 bottom-0 flex items-center justify-center text-nexora-text-muted transition-colors group-focus-within:text-nexora-green ${large ? 'w-14' : 'w-10'}`}>
          {isLoading ? (
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
          placeholder="Search for a company or enter a website URL..."
          autoFocus={autoFocus}
          className={`w-full bg-white border-2 border-nexora-offwhite rounded-2xl text-nexora-navy placeholder:text-slate-400 focus:outline-none focus:border-nexora-green focus:ring-4 focus:ring-nexora-green/10 transition-all shadow-sm ${
            large ? 'py-5 pl-14 pr-24 text-lg' : 'py-3 pl-10 pr-14 text-sm'
          }`}
          disabled={isLoading}
        />
        
        <div className={`absolute right-2 top-2 bottom-2 flex items-center gap-2`}>
          {input.trim() && !isLoading && (
            <span className="hidden sm:flex text-xs font-semibold text-nexora-green bg-nexora-green/20 px-2 py-1 rounded-md items-center gap-1">
              <span className="opacity-50">Press</span> Enter
            </span>
          )}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`bg-nexora-navy hover:bg-nexora-navy-light text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              large ? 'w-12 h-full' : 'w-10 h-full'
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
            className="absolute top-full left-0 right-0 mt-2 p-3 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-100 flex items-center gap-2 z-10"
          >
            <span className="font-bold">Error:</span> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
