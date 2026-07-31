import React from 'react'

type BadgeVariant = 'emerald' | 'amber' | 'rose' | 'charcoal' | 'outline' | 'gold' | 'default'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  icon?: React.ReactNode
  className?: string
}

export function Badge({ children, variant = 'default', icon, className = '' }: BadgeProps) {
  const variants = {
    emerald: 'bg-nexora-green/20 text-nexora-green border-nexora-green/20',
    amber: 'bg-nexora-orange/20 text-nexora-orange border-nexora-orange/20',
    gold: 'bg-nexora-yellow/10 text-nexora-yellow border-nexora-yellow/20',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    charcoal: 'bg-nexora-navy text-white border-nexora-navy',
    outline: 'bg-transparent text-nexora-navy-light border-nexora-offwhite hover:bg-nexora-offwhite',
    default: 'bg-nexora-offwhite text-nexora-navy-light border-nexora-subtle'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border transition-colors ${variants[variant]} ${className}`}>
      {icon && <span className="opacity-70">{icon}</span>}
      {children}
    </span>
  )
}
