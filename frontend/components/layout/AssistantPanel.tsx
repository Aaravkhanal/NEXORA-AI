'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Trash2, Copy, Check, Loader2, ChevronDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { usePathname } from 'next/navigation'
import api from '@/lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: { source: string; url?: string; confidence?: string }[]
  timestamp: Date
}

interface AssistantPanelProps {
  isOpen: boolean
  onClose: () => void
}

const SUGGESTED_PROMPTS = [
  'Explain this company\'s business model',
  'Who are the main competitors?',
  'Summarize recent developments',
  'What are the strengths and weaknesses?',
  'Explain the revenue model',
  'What is the technology stack?',
]

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-nexora-mediumgray hover:text-nexora-charcoal hover:bg-black/5 rounded-lg"
      title="Copy response"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-nexora-emerald" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

export function AssistantPanel({ isOpen, onClose }: AssistantPanelProps) {
  const pathname = usePathname()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Extract report ID from URL if on a report page
  const reportId = pathname.startsWith('/report/') ? pathname.split('/')[2] : null
  const companyName = reportId ? 'this company' : 'a company'

  // Welcome message when panel opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = reportId
        ? `👋 Hi! I'm your Nexora AI Assistant. I've analyzed this company's data and I'm ready to answer your questions. What would you like to know?`
        : `👋 Hi! I'm your Nexora AI Assistant. Search for a company to start a deep analysis, then ask me anything about it!`
      setMessages([{
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }])
    }
  }, [isOpen, reportId, messages.length])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return
    if (!reportId) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '🔍 Please search for a company first, then I can answer specific questions about it using real data!',
        timestamp: new Date(),
      }])
      return
    }

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await api.sendChatMessage(reportId, text, sessionId)
      setSessionId(response.session_id)
      const assistantMsg: Message = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err?.response?.data?.detail || 'Please try again.'}`,
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, reportId, sessionId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleClear = () => {
    setMessages([])
    setSessionId(undefined)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed top-4 bottom-4 right-4 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-glass border border-black/5 flex flex-col z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-black/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-nexora-charcoal rounded-xl flex items-center justify-center p-1.5">
                  <img src="/owl.png" alt="Nexora Owl" className="w-full h-full object-contain" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-nexora-emerald rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="font-bold text-nexora-charcoal text-sm">Nexora AI Assistant</h3>
                <p className="text-xs text-nexora-emerald font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-nexora-emerald inline-block animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-2 text-nexora-mediumgray hover:text-nexora-charcoal hover:bg-nexora-lightgray rounded-full transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-nexora-mediumgray hover:text-nexora-charcoal hover:bg-nexora-lightgray rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 shrink-0 bg-nexora-charcoal rounded-lg flex items-center justify-center p-1 mt-1">
                      <img src="/owl.png" alt="AI" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className={`group relative max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-nexora-charcoal text-white rounded-tr-none'
                        : 'bg-nexora-warmwhite text-nexora-charcoal rounded-tl-none border border-black/5'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose-nexora prose prose-sm max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1 ml-1">
                        <CopyButton text={msg.content} />
                        {msg.sources && msg.sources.length > 0 && (
                          <span className="text-[10px] text-nexora-mediumgray">
                            {msg.sources.length} source{msg.sources.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-7 h-7 shrink-0 bg-nexora-charcoal rounded-lg flex items-center justify-center p-1">
                  <img src="/owl.png" alt="AI" className="w-full h-full object-contain" />
                </div>
                <div className="bg-nexora-warmwhite rounded-2xl rounded-tl-none px-4 py-3 border border-black/5 flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-nexora-emerald rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-nexora-mediumgray">Analyzing...</span>
                </div>
              </motion.div>
            )}

            {/* Suggested prompts - shown only at start */}
            {messages.length <= 1 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2"
              >
                <p className="text-[10px] font-bold text-nexora-mediumgray mb-3 uppercase tracking-widest px-1">Try asking:</p>
                <div className="space-y-2">
                  {SUGGESTED_PROMPTS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="w-full flex items-center gap-3 p-3 text-left text-xs font-medium text-nexora-charcoal hover:bg-nexora-warmwhite border border-black/5 hover:border-nexora-emerald/30 rounded-xl transition-all group"
                    >
                      <SparkleIcon className="w-3.5 h-3.5 text-nexora-mediumgray group-hover:text-nexora-emerald transition-colors shrink-0" />
                      {q}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-black/5 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything about this company..."
                disabled={isLoading}
                className="flex-1 bg-nexora-warmwhite border border-black/5 rounded-2xl py-3 px-4 text-sm text-nexora-charcoal placeholder:text-nexora-mediumgray focus:outline-none focus:ring-2 focus:ring-nexora-emerald/20 focus:border-nexora-emerald transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-nexora-emerald text-white rounded-xl flex items-center justify-center hover:bg-nexora-forest transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
            <p className="text-[10px] text-nexora-mediumgray text-center mt-2">
              Powered by Nexora RAG • Responses cite real sources
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
