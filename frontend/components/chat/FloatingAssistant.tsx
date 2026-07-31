'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Maximize2, Minimize2, Sparkles, Brain, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export function FloatingAssistant() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [chatSessionId, setChatSessionId] = useState<string | null>(null)
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isOpen])

  // Optional: Global keyboard shortcut (Cmd+K or similar) could be added here
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return

    const msg = chatInput
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: msg }])
    setIsChatLoading(true)

    try {
      // NOTE: In a global context without a specific report ID, 
      // we would normally hit a general /chat endpoint.
      // For now, if we don't have a report context, we just return a stub or hit a general query.
      // To make it fully functional globally, the backend needs a generic chat endpoint.
      // We will simulate a response or prompt them to open a report first.
      
      const currentPath = window.location.pathname
      const reportIdMatch = currentPath.match(/\/report\/([a-zA-Z0-9-]+)/)
      
      if (reportIdMatch && reportIdMatch[1]) {
        const reportId = reportIdMatch[1]
        const res = await api.sendChatMessage(reportId, msg, chatSessionId || undefined)
        setChatSessionId(res.session_id)
        setChatMessages(prev => [
          ...prev, 
          { role: 'assistant', content: res.answer, sources: res.sources, model_used: res.model_used }
        ])
      } else {
        // Hit global chat endpoint
        const res = await api.sendChatMessage('global', msg, chatSessionId || undefined)
        setChatSessionId(res.session_id)
        setChatMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: res.answer, 
            sources: res.sources,
            model_used: res.model_used 
          }
        ])
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: "Please wait for the report to finish generating before asking questions." }])
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error." }])
      }
    } finally {
      setIsChatLoading(false)
    }
  }

  const toggleExpand = () => setIsExpanded(!isExpanded)

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-nexora-border-subtle flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded 
                ? 'bottom-6 right-6 left-6 top-20 md:left-auto md:w-[600px] md:h-[80vh]' 
                : 'bottom-24 right-6 w-[380px] h-[550px] max-h-[70vh]'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-nexora-navy text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-nexora-navy-light flex items-center justify-center relative">
                  <Brain className="w-4 h-4 text-nexora-green" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-nexora-green rounded-full border-2 border-nexora-navy"></div>
                </div>
                <div>
                  <h3 className="font-syne font-bold text-sm">Nexora Assistant</h3>
                  <p className="text-[10px] text-nexora-text-muted flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-nexora-yellow" /> Multi-LLM Active
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={toggleExpand} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-nexora-text-muted hover:text-white hidden md:block">
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-rose-500/20 hover:text-rose-400 rounded-md transition-colors text-nexora-text-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-nexora-cream space-y-4">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-nexora-border-subtle flex items-center justify-center shadow-sm mb-4">
                    <MessageSquare className="w-8 h-8 text-nexora-green opacity-80" />
                  </div>
                  <h4 className="font-syne font-bold text-nexora-navy mb-2">How can I help?</h4>
                  <p className="text-sm text-nexora-text-secondary">
                    I can analyze revenue, summarize competitors, or extract key insights from the active company dashboard.
                  </p>
                  
                  <div className="mt-8 flex flex-wrap gap-2 justify-center">
                    {["Summarize the business model", "List top competitors", "What are the main risks?"].map(prompt => (
                      <button 
                        key={prompt}
                        onClick={() => setChatInput(prompt)}
                        className="text-xs bg-white border border-nexora-border-subtle text-nexora-navy px-3 py-1.5 rounded-full hover:border-nexora-green hover:text-nexora-green transition-colors shadow-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3.5 text-sm shadow-sm ${
                      msg.role === 'user' 
                        ? 'chat-bubble-user' 
                        : 'chat-bubble-ai'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose-nexora text-sm">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                          
                          {/* Citations Footer */}
                          {(msg.model_used || (msg.sources && msg.sources.length > 0)) && (
                            <div className="mt-3 pt-2 border-t border-nexora-border-subtle text-[10px] text-nexora-text-muted flex flex-col gap-1.5">
                              {msg.model_used && (
                                <span className="flex items-center gap-1">
                                  <Brain className="w-3 h-3" /> {msg.model_used}
                                </span>
                              )}
                              {msg.sources && msg.sources.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {msg.sources.slice(0,4).map((s: any, idx: number) => (
                                    <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="px-1.5 py-0.5 rounded bg-nexora-offwhite hover:bg-nexora-border-subtle text-nexora-text-secondary transition-colors inline-flex items-center gap-1">
                                      [{idx+1}] {s.source}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="chat-bubble-ai p-4 flex gap-1.5 items-center">
                    <Loader2 className="w-4 h-4 text-nexora-green animate-spin" />
                    <span className="text-xs text-nexora-text-muted font-medium tracking-wider uppercase">Synthesizing...</span>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-nexora-border-subtle shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask a question... (Cmd+J to toggle)"
                  className="w-full bg-nexora-offwhite border border-nexora-border-subtle rounded-xl py-3 pl-4 pr-12 text-sm text-nexora-navy placeholder:text-nexora-text-muted focus:outline-none focus:border-nexora-green focus:ring-2 focus:ring-nexora-green/10 transition-all"
                  disabled={isChatLoading}
                />
                <button 
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-nexora-navy text-white rounded-lg disabled:opacity-50 hover:bg-nexora-navy-light transition-colors flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-nexora-navy text-white rounded-2xl shadow-premium flex items-center justify-center z-40 group border border-nexora-navy-light"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute right-full mr-4 bg-nexora-navy text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-nexora-border-subtle">
            Ask Nexora AI
            {/* Tooltip arrow */}
            <span className="absolute top-1/2 -right-1 w-2 h-2 bg-nexora-navy transform -translate-y-1/2 rotate-45"></span>
          </span>
        )}
      </motion.button>
    </>
  )
}
