'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { Mic, MessageSquare, Eye, Cpu, ArrowUpRight, Zap, Shield, Layers } from 'lucide-react'
import { AnimatedGradientText } from '@/components/magic/AnimatedGradientText'

const FEATURES = [
  {
    href: '/captions',
    icon: MessageSquare,
    title: 'Live Captions',
    desc: 'Real-time speech-to-text with 30-word rolling window. Designed for deaf and hard-of-hearing users. Zero lag, RAF-throttled updates.',
    color: '#7c3aed',
    accentColor: 'rgba(124,58,237,',
    badge: 'Deaf Accessible',
    size: 'large', // col-span-2, row-span-2
    stats: '< 500ms',
    statsLabel: 'Latency',
  },
  {
    href: '#',
    icon: Mic,
    title: 'Voice Navigation',
    desc: 'Navigate the entire platform using just your voice. Zero-touch browsing for motor-impaired users.',
    color: '#3b82f6',
    accentColor: 'rgba(59,130,246,',
    badge: 'Motor Accessible',
    size: 'normal',
    stats: '99%',
    statsLabel: 'Accuracy',
  },
  {
    href: '/vision',
    icon: Eye,
    title: 'Vision Assist',
    desc: 'Two-finger pinch gesture via webcam opens accessibility overlays. No extra hardware required.',
    color: '#06b6d4',
    accentColor: 'rgba(6,182,212,',
    badge: 'Vision Accessible',
    size: 'normal',
    stats: '60fps',
    statsLabel: 'Tracking',
  },
  {
    href: '/product',
    icon: Cpu,
    title: 'Haptic Braille',
    desc: 'Arduino-powered tactile vibration device converts on-screen text to Braille dot patterns in real time via Web Serial API.',
    color: '#10b981',
    accentColor: 'rgba(16,185,129,',
    badge: 'Tactile Output',
    size: 'wide', // col-span-2
    stats: '6-dot',
    statsLabel: 'Braille Grade',
  },
]

const TRUST_ITEMS = [
  { icon: Zap, text: 'Zero Config Setup' },
  { icon: Shield, text: 'Privacy First — Runs Locally' },
  { icon: Layers, text: 'Works on Any Device' },
]

function FeatureCard({ feature, index }: { feature: typeof FEATURES[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = feature.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={
        feature.size === 'large'
          ? 'md:col-span-2 md:row-span-2'
          : feature.size === 'wide'
          ? 'md:col-span-2'
          : ''
      }
    >
      <Link href={feature.href} className="group block h-full">
        <div
          className="relative h-full rounded-2xl border overflow-hidden transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl"
          style={{
            borderColor: `${feature.accentColor}0.2)`,
            background: `linear-gradient(135deg, ${feature.accentColor}0.08) 0%, rgba(13,13,20,0.95) 60%)`,
            boxShadow: `0 0 0 0 ${feature.accentColor}0)`,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.boxShadow = `0 20px 60px -10px ${feature.accentColor}0.3), inset 0 1px 0 ${feature.accentColor}0.1)`
            el.style.borderColor = `${feature.accentColor}0.4)`
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.boxShadow = `0 0 0 0 ${feature.accentColor}0)`
            el.style.borderColor = `${feature.accentColor}0.2)`
          }}
        >
          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
          />

          {/* Top glow line */}
          <div
            className="absolute top-0 left-[10%] right-[10%] h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${feature.accentColor}0.6), transparent)` }}
          />

          <div className={`p-6 flex flex-col h-full ${feature.size === 'large' ? 'min-h-[300px]' : 'min-h-[160px]'}`}>
            {/* Header row */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${feature.accentColor}0.15)`,
                    border: `1px solid ${feature.accentColor}0.3)`,
                    boxShadow: `0 0 20px ${feature.accentColor}0.15)`,
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: feature.color }} />
                </div>
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                  style={{
                    color: feature.color,
                    borderColor: `${feature.accentColor}0.3)`,
                    background: `${feature.accentColor}0.1)`,
                  }}
                >
                  {feature.badge}
                </span>
              </div>
              <ArrowUpRight
                className="h-4 w-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0 mt-1"
              />
            </div>

            {/* Title & desc */}
            <h3
              className={`font-bold text-white mb-3 ${feature.size === 'large' ? 'text-2xl' : 'text-xl'}`}
            >
              {feature.title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-1">
              {feature.desc}
            </p>

            {/* Bottom stat chip */}
            <div className="mt-5 pt-4 border-t" style={{ borderColor: `${feature.accentColor}0.12)` }}>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black" style={{ color: feature.color }}>
                  {feature.stats}
                </span>
                <span className="text-xs text-slate-500">{feature.statsLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function FeatureGrid() {
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Section background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.07) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-600/8 px-4 py-1.5 text-sm font-medium text-purple-300 mb-5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            Platform Capabilities
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
            Four Modes of{' '}
            <AnimatedGradientText as="span">Accessibility</AnimatedGradientText>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
            Every feature is production-ready, hardware-connected, and built for real users across Bharat.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>

        {/* Trust bar */}
        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {TRUST_ITEMS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-slate-500 text-sm">
              <Icon className="h-4 w-4 text-slate-600" />
              {text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
