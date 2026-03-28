'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mic, MessageSquare, Eye, Cpu, ArrowUpRight } from 'lucide-react'
import { GlowCard } from '@/components/magic/GlowCard'
import { AnimatedGradientText } from '@/components/magic/AnimatedGradientText'

const FEATURES = [
  {
    href: '/captions',
    icon: MessageSquare,
    title: 'Live Captions',
    desc: 'Real-time speech-to-text with 30-word rolling window. Designed for deaf and hard-of-hearing users. Zero lag, RAF-throttled updates.',
    color: '#7c3aed',
    gradient: 'from-purple-600/20 to-blue-600/10',
    badge: 'Deaf Accessible',
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-600/10',
    span: 'col-span-2',
  },
  {
    href: '#',
    icon: Mic,
    title: 'Voice Navigation',
    desc: 'Navigate the entire platform using just your voice. Zero-touch browsing for motor-impaired users.',
    color: '#3b82f6',
    gradient: 'from-blue-600/20 to-cyan-600/10',
    badge: 'Motor Accessible',
    badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-600/10',
    span: 'col-span-1',
  },
  {
    href: '/vision',
    icon: Eye,
    title: 'Vision Assist',
    desc: 'Two-finger pinch gesture via webcam opens accessibility overlays. No hardware required.',
    color: '#06b6d4',
    gradient: 'from-cyan-600/20 to-teal-600/10',
    badge: 'Vision Accessible',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-600/10',
    span: 'col-span-1',
  },
  {
    href: '/product',
    icon: Cpu,
    title: 'Haptic Braille',
    desc: 'Arduino-powered tactile vibration device converts on-screen text to Braille dot patterns in real time via Web Serial.',
    color: '#10b981',
    gradient: 'from-green-600/20 to-emerald-600/10',
    badge: 'Tactile Output',
    badgeColor: 'text-green-400 border-green-500/30 bg-green-600/10',
    span: 'col-span-2',
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function FeatureGrid() {
  return (
    <section className="relative py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            Platform Capabilities
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Four Modes of{' '}
            <AnimatedGradientText as="span">Accessibility</AnimatedGradientText>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Every feature is production-ready, hardware-connected, and built for real users.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                variants={cardVariants}
                className={`md:${f.span}`}
              >
                <GlowCard
                  glowColor={f.color}
                  className={`h-full bg-gradient-to-br ${f.gradient} border border-white/8 backdrop-blur-sm p-6 group cursor-pointer`}
                >
                  <Link href={f.href} className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${f.color}22`, border: `1px solid ${f.color}33` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: f.color }} />
                      </div>
                      <ArrowUpRight
                        className="h-4 w-4 text-white/20 group-hover:text-white/60 transition-colors duration-200"
                      />
                    </div>
                    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium mb-3 ${f.badgeColor}`}>
                      {f.badge}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed flex-1">{f.desc}</p>
                  </Link>
                </GlowCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
