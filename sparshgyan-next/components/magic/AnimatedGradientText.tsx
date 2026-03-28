'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface AnimatedGradientTextProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p'
}

export function AnimatedGradientText({
  children,
  className,
  as: Tag = 'span',
}: AnimatedGradientTextProps) {
  return (
    <Tag
      className={cn(
        'bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent',
        'bg-[length:300%_300%] animate-gradient-x',
        className
      )}
    >
      {children}
    </Tag>
  )
}
