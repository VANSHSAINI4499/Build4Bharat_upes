'use client'

import React from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { ArrowRight, Mic, Eye, Zap, Hand, Sparkles, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGradientText } from '@/components/magic/AnimatedGradientText'

// Load Three.js canvas client-side only (no SSR)
const AccessibilityScene = dynamic(
  () => import('@/components/3d/AccessibilityScene'),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
)

const PILLS = [
  { icon: Mic, label: 'Voice Navigation', color: 'text-purple-400', bg: 'bg-purple-600/10 border-purple-500/25' },
  { icon: Eye, label: 'Braille Haptics', color: 'text-blue-400', bg: 'bg-blue-600/10 border-blue-500/25' },
  { icon: Zap, label: 'Live Captions', color: 'text-cyan-400', bg: 'bg-cyan-600/10 border-cyan-500/25' },
  { icon: Hand, label: 'Gesture Control', color: 'text-green-400', bg: 'bg-green-600/10 border-green-500/25' },
]

const STATS = [
  { value: '500ms', label: 'Caption Latency', color: 'text-purple-400' },
  { value: '4', label: 'Accessibility Modes', color: 'text-blue-400' },
  { value: '100%', label: 'Open Source', color: 'text-cyan-400' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Deep space background */}
      <div className="absolute inset-0 bg-[#030307]" />

      {/* Gradient blobs */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 65%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)', filter: 'blur(50px)' }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Main content — two-column split */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">

        {/* ── Left column: text ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start"
        >
          {/* Eyebrow badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-600/10 px-4 py-1.5 text-sm font-medium text-purple-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              Accessibility-First Platform for Bharat
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight text-white mb-6"
          >
            Break Every
            <br />
            <AnimatedGradientText as="span">Barrier</AnimatedGradientText>
            <br />
            <span className="text-slate-300">to Learning</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-400 max-w-xl mb-10 leading-relaxed"
          >
            Sparshgyan bridges the accessibility gap with real-time voice captions,
            Arduino-powered haptic Braille, AI gesture recognition, and vision assistance —
            built for every learner in Bharat.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-12">
            <Link
              href="/captions"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:from-purple-500 hover:to-blue-500 transition-all duration-200"
            >
              Start Live Captions
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/vision"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              Explore Vision Assist
            </Link>
          </motion.div>

          {/* Feature pills */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2.5 mb-12">
            {PILLS.map(({ icon: Icon, label, color, bg }) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm ${bg}`}
              >
                <Icon className={`h-3 w-3 ${color}`} />
                <span className="text-slate-300">{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="flex items-center gap-8">
            {STATS.map(({ value, label, color }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <div className="h-8 w-px bg-white/10" />}
                <div>
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right column: 3D scene ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
          className="relative h-[500px] lg:h-[680px] w-full"
        >
          {/* Glow ring behind canvas */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.2) 0%, rgba(59,130,246,0.1) 40%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
          <AccessibilityScene />

          {/* Floating label badges over canvas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="absolute top-[18%] left-[2%] flex items-center gap-2 rounded-xl border border-purple-500/25 bg-purple-600/15 px-3 py-2 backdrop-blur-md"
          >
            <Mic className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-xs text-purple-300 font-medium">Voice AI</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="absolute top-[25%] right-[4%] flex items-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-600/15 px-3 py-2 backdrop-blur-md"
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs text-cyan-300 font-medium">Live Captions</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="absolute bottom-[22%] left-[4%] flex items-center gap-2 rounded-xl border border-green-500/25 bg-green-600/15 px-3 py-2 backdrop-blur-md"
          >
            <Hand className="h-3.5 w-3.5 text-green-400" />
            <span className="text-xs text-green-300 font-medium">Haptic Braille</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            className="absolute bottom-[18%] right-[2%] flex items-center gap-2 rounded-xl border border-blue-500/25 bg-blue-600/15 px-3 py-2 backdrop-blur-md"
          >
            <Eye className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs text-blue-300 font-medium">Vision Assist</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <span className="text-xs text-slate-600 tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-4 w-4 text-slate-600" />
        </motion.div>
      </motion.div>
    </section>
  )
}
