'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Plug, Cable, Sparkles, Rocket } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    icon: Plug,
    title: 'Connect Your Device',
    desc: 'Plug in your Arduino via USB or connect your microphone. Sparshgyan auto-detects hardware using Web Serial and Web Audio APIs.',
    color: '#7c3aed',
    accentColor: 'rgba(124,58,237,',
  },
  {
    step: '02',
    icon: Cable,
    title: 'Choose Your Mode',
    desc: 'Select from Live Captions, Haptic Braille, Voice Navigation, or Vision Assist. Mix and match — all modes run simultaneously.',
    color: '#3b82f6',
    accentColor: 'rgba(59,130,246,',
  },
  {
    step: '03',
    icon: Sparkles,
    title: 'AI Kicks In',
    desc: 'Our real-time AI pipeline processes speech, gestures, and visual input with sub-500ms latency — no cloud required.',
    color: '#06b6d4',
    accentColor: 'rgba(6,182,212,',
  },
  {
    step: '04',
    icon: Rocket,
    title: 'Reach Every Learner',
    desc: 'Learners with visual, auditory, or motor disabilities interact with content naturally. Zero configuration needed from their end.',
    color: '#10b981',
    accentColor: 'rgba(16,185,129,',
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07070f] to-transparent pointer-events-none" />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at bottom, rgba(59,130,246,0.06) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-600/8 px-4 py-1.5 text-sm font-medium text-blue-300 mb-5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Simple Setup
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
            Up and Running in{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              4 Steps
            </span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            No PhD required. Sparshgyan is built for educators, not engineers.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop only) */}
          <div className="absolute hidden lg:block top-[2.75rem] left-[12.5%] right-[12.5%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3) 20%, rgba(6,182,212,0.3) 80%, transparent)' }}
          />

          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.12 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step circle */}
                <div
                  className="relative z-10 h-14 w-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${s.accentColor}0.15)`,
                    border: `1px solid ${s.accentColor}0.35)`,
                    boxShadow: `0 0 24px ${s.accentColor}0.15)`,
                  }}
                >
                  <Icon className="h-6 w-6" style={{ color: s.color }} />
                </div>

                {/* Step number */}
                <span
                  className="text-[10px] font-bold tracking-[0.2em] mb-2"
                  style={{ color: `${s.accentColor}0.6)` }}
                >
                  STEP {s.step}
                </span>

                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-white/90">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[220px] mx-auto">
                  {s.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
