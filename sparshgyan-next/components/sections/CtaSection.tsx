'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Github, Globe } from 'lucide-react'

const MiniScene = dynamic(() => import('@/components/3d/MiniCtaScene'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
})

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative py-24 px-6 overflow-hidden" ref={ref}>
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.12) 0%, transparent 60%)' }}
      />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(13,13,20,0.98) 40%, rgba(59,130,246,0.08) 100%)',
            border: '1px solid rgba(124,58,237,0.2)',
            boxShadow: '0 0 80px -20px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Top glow border */}
          <div
            className="absolute top-0 left-[15%] right-[15%] h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.7), rgba(59,130,246,0.7), transparent)' }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
            {/* Left: Text */}
            <div className="p-10 lg:p-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-600/10 px-3.5 py-1.5 text-xs font-medium text-purple-300 mb-6">
                <Globe className="h-3 w-3" />
                Open Source · Made in Bharat
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
                Ready to make learning
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  truly accessible?
                </span>
              </h2>

              <p className="text-slate-400 mb-8 leading-relaxed">
                Connect your Arduino, plug in a mic, and start reaching learners with
                disabilities in minutes — no configuration needed.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/captions"
                  className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:from-purple-500 hover:to-blue-500 transition-all duration-200"
                >
                  Start Now — It&apos;s Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/vision"
                  className="inline-flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </Link>
              </div>
            </div>

            {/* Right: Mini 3D */}
            <div className="relative h-[300px] lg:h-[380px] w-full">
              <MiniScene />
            </div>
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          className="text-center text-xs text-slate-600 mt-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Built for UPES Hackathon · Build4Bharat Initiative · 100% Open Source
        </motion.p>
      </div>
    </section>
  )
}
