'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { SearchInput } from '@/components/ui/SearchInput'
import api, { type ReportListItem } from '@/lib/api'

export default function LandingPage() {
  return (
    <div className="w-full relative overflow-hidden bg-nexora-warmwhite min-h-[calc(100vh-80px)]">
      
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-nexora-emerald/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-nexora-amber/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-nexora-emerald/20 rounded-full animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-nexora-amber/30 rounded-full animate-float"></div>
      
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Column: Hero Text & Search */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-nexora-emerald/10 border border-nexora-emerald/20 text-nexora-forest text-xs font-bold uppercase tracking-widest mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-nexora-emerald animate-pulse"></span>
            AI-Powered Company Intelligence
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-syne font-bold text-nexora-charcoal tracking-tight leading-[1.1] mb-6"
          >
            Understand Any <br />
            Company in <span className="text-nexora-emerald">Minutes.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-nexora-mediumgray max-w-xl mx-auto lg:mx-0 mb-10"
          >
            Nexora AI researches businesses, analyzes competitors, financials, and market position to deliver executive insights you can trust.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-2xl mx-auto lg:mx-0"
          >
            <SearchInput large autoFocus />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2 items-center text-sm font-semibold text-nexora-mediumgray"
          >
            <span className="mr-2">Popular Searches:</span>
            {["Apple", "Microsoft", "NVIDIA", "Tesla", "OpenAI", "Stripe", "Vercel"].map(company => (
              <button key={company} className="px-4 py-1.5 bg-white border border-black/5 rounded-full hover:border-nexora-emerald hover:text-nexora-emerald transition-colors shadow-sm text-nexora-charcoal">
                {company}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Hero Illustration / UI Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex-1 w-full max-w-lg lg:max-w-none relative"
        >
          {/* We will simulate the illustration from the mockup with our owl */}
          <div className="relative w-full aspect-square md:aspect-video lg:aspect-square bg-white rounded-[3rem] shadow-glass border border-black/5 p-8 flex flex-col items-center justify-center overflow-hidden group">
            
            <div className="absolute inset-0 bg-gradient-to-br from-nexora-warmwhite to-white z-0"></div>
            
            {/* Mockup Chart Elements */}
            <div className="absolute top-1/4 left-10 w-24 h-32 flex items-end gap-2 z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
              <div className="w-1/3 bg-nexora-emerald rounded-t-sm h-12"></div>
              <div className="w-1/3 bg-nexora-emerald rounded-t-sm h-20"></div>
              <div className="w-1/3 bg-nexora-amber rounded-t-sm h-32"></div>
            </div>

            <div className="absolute bottom-1/4 right-10 w-24 h-24 z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
               <div className="w-full h-full rounded-full border-[12px] border-nexora-emerald border-r-nexora-amber border-t-nexora-orange"></div>
            </div>

            {/* Owl Mascot Center */}
            <motion.div 
              className="relative z-20 w-48 h-48"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
            >
              <img src="/owl.png" alt="Nexora Mascot" className="w-full h-full object-contain drop-shadow-2xl" />
            </motion.div>
          </div>
        </motion.div>

      </div>

      {/* Statistics Section */}
      <div className="border-t border-black/5 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-black/5">
          <div className="text-center px-4">
            <div className="w-12 h-12 mx-auto bg-nexora-emerald/10 text-nexora-emerald rounded-2xl flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h3 className="text-3xl font-bold font-syne text-nexora-charcoal mb-1">1000+</h3>
            <p className="text-sm font-semibold text-nexora-mediumgray">Companies Analyzed</p>
          </div>
          <div className="text-center px-4">
            <div className="w-12 h-12 mx-auto bg-nexora-orange/10 text-nexora-orange rounded-2xl flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            </div>
            <h3 className="text-3xl font-bold font-syne text-nexora-charcoal mb-1">50+</h3>
            <p className="text-sm font-semibold text-nexora-mediumgray">Public Data Sources</p>
          </div>
          <div className="text-center px-4">
            <div className="w-12 h-12 mx-auto bg-nexora-amber/10 text-nexora-amber rounded-2xl flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-3xl font-bold font-syne text-nexora-charcoal mb-1">98%</h3>
            <p className="text-sm font-semibold text-nexora-mediumgray">Citation Accuracy</p>
          </div>
          <div className="text-center px-4">
            <div className="w-12 h-12 mx-auto bg-nexora-forest/10 text-nexora-forest rounded-2xl flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-3xl font-bold font-syne text-nexora-charcoal mb-1">24/7</h3>
            <p className="text-sm font-semibold text-nexora-mediumgray">AI Analyst</p>
          </div>
        </div>
      </div>
    </div>
  )
}
