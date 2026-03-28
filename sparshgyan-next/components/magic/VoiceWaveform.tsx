'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const BAR_COUNT = 20

interface VoiceWaveformProps {
  active?: boolean
  className?: string
  color?: string
}

export function VoiceWaveform({
  active = false,
  className,
  color = '#7c3aed',
}: VoiceWaveformProps) {
  return (
    <div
      className={cn('flex items-center justify-center gap-[3px]', className)}
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const centerDist = Math.abs(i - (BAR_COUNT - 1) / 2) / ((BAR_COUNT - 1) / 2)
        const maxH = active ? 28 - centerDist * 10 : 4
        const minH = active ? 4 : 4

        return (
          <motion.div
            key={i}
            className="w-[3px] rounded-full origin-bottom"
            style={{ backgroundColor: color }}
            animate={
              active
                ? {
                    scaleY: [1, (maxH / minH) * (0.6 + Math.random() * 0.4), 1],
                    opacity: [0.6, 1, 0.6],
                  }
                : { scaleY: 1, opacity: 0.3 }
            }
            transition={
              active
                ? {
                    duration: 0.6 + Math.random() * 0.6,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    delay: (i / BAR_COUNT) * 0.3,
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
            style={{ height: `${minH}px`, backgroundColor: color }}
          />
        )
      })}
    </div>
  )
}
