'use client'

import React from 'react'
import { motion } from 'framer-motion'

const NUM_BEAMS = 14

interface Beam {
  x: number
  delay: number
  duration: number
  width: number
  opacity: number
}

const beams: Beam[] = Array.from({ length: NUM_BEAMS }, (_, i) => ({
  x: (i / (NUM_BEAMS - 1)) * 110 - 5,
  delay: i * 0.4,
  duration: 6 + (i % 4) * 1.5,
  width: 1 + (i % 3) * 0.5,
  opacity: 0.08 + (i % 5) * 0.025,
}))

export function BackgroundBeams({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="beamGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
            <stop offset="50%" stopColor="#7c3aed" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beamGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
        {beams.map((beam, i) => (
          <line
            key={i}
            x1={beam.x}
            y1="-20"
            x2={beam.x + 40}
            y2="120"
            stroke={i % 3 === 0 ? 'url(#beamGrad2)' : 'url(#beamGrad1)'}
            strokeWidth={beam.width}
            strokeOpacity={beam.opacity}
          />
        ))}
      </svg>

      {/* Animated moving beams */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-y-0"
          style={{
            left: `${20 + i * 30}%`,
            width: '2px',
            background:
              i === 1
                ? 'linear-gradient(to bottom, transparent, #7c3aed33, #3b82f633, transparent)'
                : 'linear-gradient(to bottom, transparent, #06b6d433, transparent)',
          }}
          animate={{ opacity: [0, 0.6, 0], y: ['-10%', '10%', '-10%'] }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 2.5,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Radial glow spots */}
      <div
        className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full opacity-8"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
    </div>
  )
}
