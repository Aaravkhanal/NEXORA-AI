'use client'

import React, { useState } from 'react'
import { MessageSquare, Brain, Sparkles, Send, Loader2, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'

export default function AssistantPage() {
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isLoading) return
    
    setMessages(prev => [...prev, { role: 'user', content: chatInput }])
    setChatInput('')
    setIsLoading(true)

    // Mock global chat response since we don't have a specific report context here yet
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I am the Nexora AI Assistant. Currently, I am optimized for querying specific company reports. Please search for a company on the dashboard to access deep insights, or ask me general questions about business strategy.",
        model_used: "nexora-router"
      }])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full p-4 md:p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-syne font-bold text-nexora-charcoal flex items-center gap-2">
            <Brain className="w-6 h-6 text-nexora-emerald" />
            Intelligence Assistant
          </h1>
          <p className="text-sm text-nexora-text-secondary mt-1">Chat with the multi-agent system about market trends, strategy, or previously saved companies.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden !p-0 shadow-premium">
        
        {/* Chat history */}
        <div className="flex-1 overflow-y-auto p-6 bg-nexora-cream/50 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-nexora-border-subtle flex items-center justify-center relative">
                <span className="font-syne font-bold text-3xl text-nexora-charcoal">N</span>
                <Sparkles className="w-6 h-6 text-nexora-gold absolute -top-2 -right-2 animate-pulse" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-xl text-nexora-charcoal mb-2">How can I assist you today?</h3>
                <p className="text-nexora-text-secondary text-sm">I can help you analyze competitors, synthesize market data, or review your recent intelligence reports.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2 w-full mt-4">
                {[
                  "What are the emerging trends in AI infrastructure?",
                  "Compare the business models of Stripe and Adyen.",
                  "Summarize my recent report on Microsoft.",
                ].map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => setChatInput(prompt)}
                    className="flex items-center justify-between p-3 bg-white border border-nexora-border-subtle rounded-xl hover:border-nexora-emerald hover:shadow-sm transition-all group text-left"
                  >
                    <span className="text-sm font-medium text-nexora-charcoal group-hover:text-nexora-emerald transition-colors">{prompt}</span>
                    <ArrowRight className="w-4 h-4 text-nexora-text-muted group-hover:text-nexora-emerald opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'chat-bubble-user' 
                    : 'chat-bubble-ai'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="chat-bubble-ai p-4 flex gap-2 items-center">
                <Loader2 className="w-4 h-4 text-nexora-emerald animate-spin" />
                <span className="text-xs text-nexora-text-muted font-medium tracking-wider uppercase">Agents Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-nexora-border-subtle shrink-0">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full bg-nexora-offwhite border-2 border-transparent focus:border-nexora-emerald focus:bg-white rounded-2xl py-4 pl-6 pr-14 text-nexora-charcoal placeholder:text-nexora-text-muted transition-all shadow-sm focus:outline-none"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !chatInput.trim()}
              className="absolute right-2 top-2 bottom-2 w-12 bg-nexora-charcoal text-white rounded-xl flex items-center justify-center hover:bg-nexora-charcoalLight disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-[10px] text-nexora-text-muted">Nexora AI can make mistakes. Consider verifying critical intelligence.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
