'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

interface AccessibilityScoreProps {
  score: number
  size?: number
  strokeWidth?: number
}

export function AccessibilityScore({
  score,
  size = 80,
  strokeWidth = 6,
}: AccessibilityScoreProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = useMotionValue(0)
  const displayScore = useMotionValue(0)
  const strokeDashoffset = useTransform(
    progress,
    (v) => circumference - (v / 100) * circumference
  )

  const color =
    score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : '#f59e0b'

  useEffect(() => {
    const ctrl1 = animate(progress, score, { duration: 1.5, ease: 'easeOut' })
    const ctrl2 = animate(displayScore, score, {
      duration: 1.5,
      ease: 'easeOut',
    })
    return () => {
      ctrl1.stop()
      ctrl2.stop()
    }
  }, [score, progress, displayScore])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
          filter={`drop-shadow(0 0 6px ${color}88)`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-lg font-bold leading-none"
          style={{ color }}
        >
          {useTransform(displayScore, (v) => Math.round(v).toString())}
        </motion.span>
        <span className="text-[8px] text-white/40 mt-0.5">SCORE</span>
      </div>
    </div>
  )
}
