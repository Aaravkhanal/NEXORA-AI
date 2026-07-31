import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({ children, className = '', noPadding = false, ...props }: CardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl border border-nexora-offwhite shadow-premium hover:shadow-premium-hover transition-all duration-300 overflow-hidden ${noPadding ? '' : 'p-6'} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-nexora-offwhite p-6 h-full flex flex-col gap-4">
      <div className="skeleton h-6 w-1/3 rounded"></div>
      <div className="skeleton h-4 w-full rounded"></div>
      <div className="skeleton h-4 w-5/6 rounded"></div>
      <div className="skeleton h-32 w-full rounded mt-4"></div>
    </div>
  )
}
