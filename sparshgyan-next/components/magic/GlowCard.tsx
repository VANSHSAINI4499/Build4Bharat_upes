'use client'

import React, { useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string
  children: React.ReactNode
}

export function GlowCard({
  children,
  className,
  glowColor = '#7c3aed',
  ...props
}: GlowCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { stiffness: 200, damping: 30 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  const rotateX = useTransform(springY, [-0.5, 0.5], ['6deg', '-6deg'])
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-6deg', '6deg'])

  const glowOpacity = useMotionValue(0)
  const springGlow = useSpring(glowOpacity, { stiffness: 300, damping: 40 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
    glowOpacity.set(1)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    glowOpacity.set(0)
  }

  return (
    <motion.div
      ref={containerRef}
      className={cn('relative rounded-2xl', className)}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {/* Glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${useTransform(springX, [-0.5, 0.5], ['0%', '100%'])}px ${useTransform(springY, [-0.5, 0.5], ['0%', '100%'])}px, ${glowColor}22, transparent 60%)`,
          opacity: springGlow,
        }}
      />
      {/* Border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: `0 0 30px ${glowColor}30, inset 0 1px 0 rgba(255,255,255,0.08)`,
          opacity: springGlow,
        }}
      />
      {children}
    </motion.div>
  )
}
