'use client'

import React from 'react'
import { X, Paperclip, Mic, Send } from 'lucide-react'

interface AssistantPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AssistantPanel({ isOpen, onClose }: AssistantPanelProps) {
  return (
    <div 
      className={`fixed top-4 bottom-4 right-4 w-[420px] bg-white rounded-3xl shadow-glass border border-black/5 flex flex-col transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-[450px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-nexora-charcoal rounded-xl flex items-center justify-center p-1">
              <img src="/owl.png" alt="Nexora Owl" className="w-full h-full object-contain" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-nexora-emerald rounded-full border-2 border-white"></span>
          </div>
          <div>
            <h3 className="font-bold text-nexora-charcoal">Nexora AI Assistant</h3>
            <p className="text-xs text-nexora-emerald font-medium">Online</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-nexora-mediumgray hover:bg-nexora-lightgray rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 shrink-0 bg-nexora-charcoal rounded-lg flex items-center justify-center p-1">
            <img src="/owl.png" alt="AI" className="w-full h-full object-contain" />
          </div>
          <div className="bg-nexora-warmwhite p-3 rounded-2xl rounded-tl-none border border-black/5">
            <p className="text-sm text-nexora-charcoal">
              👋 Hi Aarav! I'm your AI analyst. Ask me anything about Apple Inc.
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mt-8">
          <p className="text-xs font-bold text-nexora-mediumgray mb-3 uppercase tracking-wider">Try asking me:</p>
          <div className="space-y-2">
            {[
              "What is Apple's revenue trend?",
              "Who are Apple's main competitors?",
              "What are Apple's strengths?",
              "Explain Apple's business model",
              "Summarize latest news about Apple"
            ].map((q, i) => (
              <button key={i} className="w-full flex items-center gap-3 p-3 text-left text-sm font-medium text-nexora-charcoal hover:bg-nexora-warmwhite border border-black/5 rounded-xl transition-all hover:border-nexora-emerald/30 group">
                <SparkleIcon className="w-4 h-4 text-nexora-mediumgray group-hover:text-nexora-emerald transition-colors" />
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-black/5 rounded-b-3xl">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ask a question..."
            className="w-full bg-nexora-warmwhite border border-black/5 rounded-2xl py-3 pl-4 pr-24 text-sm text-nexora-charcoal placeholder:text-nexora-mediumgray focus:outline-none focus:ring-2 focus:ring-nexora-emerald/20 focus:border-nexora-emerald transition-all"
          />
          <div className="absolute right-2 top-1.5 flex items-center gap-1">
            <button className="p-1.5 text-nexora-mediumgray hover:text-nexora-charcoal transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-nexora-mediumgray hover:text-nexora-charcoal transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <button className="p-1.5 bg-nexora-emerald text-white rounded-xl hover:bg-nexora-forest transition-colors shadow-sm ml-1">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  )
}
