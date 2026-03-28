'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Mic, Eye, Zap, Hand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackgroundBeams } from '@/components/magic/BackgroundBeams'
import { Particles } from '@/components/magic/Particles'
import { AnimatedGradientText } from '@/components/magic/AnimatedGradientText'

const PILLS = [
  { icon: Mic, label: 'Voice Navigation', color: 'text-purple-400' },
  { icon: Eye, label: 'Braille Haptics', color: 'text-blue-400' },
  { icon: Zap, label: 'Live Captions', color: 'text-cyan-400' },
  { icon: Hand, label: 'Gesture Control', color: 'text-green-400' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[#050508]" />
      <Particles count={80} className="z-0" />
      <BackgroundBeams className="z-0" />

      {/* Centre blur glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Eyebrow badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-600/10 px-4 py-1.5 text-sm text-purple-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            Accessibility-First Platform for Bharat
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight text-white mb-6"
        >
          Accessibility{' '}
          <AnimatedGradientText as="span">Without Limits</AnimatedGradientText>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Sparshgyan bridges the accessibility gap through real-time voice captions,
          Arduino-powered haptic Braille, AI gesture control, and vision assistance —
          all in one unified platform.
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 mb-14">
          <Button size="xl" asChild>
            <Link href="/captions">
              Start Live Captions
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="/vision">Explore Vision Assist</Link>
          </Button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-3"
        >
          {PILLS.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-2 text-sm backdrop-blur-sm"
            >
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              <span className="text-slate-300">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {[
            { value: '500ms', label: 'Caption Latency' },
            { value: '4', label: 'Accessibility Modes' },
            { value: '100%', label: 'Open Source' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <AnimatedGradientText as="p" className="text-2xl font-bold">
                {value}
              </AnimatedGradientText>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
