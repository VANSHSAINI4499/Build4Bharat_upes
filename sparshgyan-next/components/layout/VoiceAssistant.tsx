'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useSpeech } from '@/lib/hooks/useSpeech'
import { useSerial } from '@/lib/hooks/useSerial'
import { VoiceWaveform } from '@/components/magic/VoiceWaveform'
import { cn } from '@/lib/utils'
import { useRouter, usePathname } from 'next/navigation'

export function VoiceAssistant() {
  const [expanded, setExpanded] = useState(false)
  const [lastCommand, setLastCommand] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  const isListening = useAppStore((s) => s.isListening)
  const statusMsg = useAppStore((s) => s.statusMsg)
  const micError = useAppStore((s) => s.micError)

  const { enqueue } = useSerial()
  const { startListening, stopListening, setEnqueue } = useSpeech({
    onVoiceCommand: useCallback((cmd: string) => {
      setLastCommand(cmd)
      const lower = cmd.toLowerCase()
      if (lower.includes('home') || lower.includes('dashboard')) router.push('/')
      if (lower.includes('caption') || lower.includes('captions')) router.push('/captions')
      if (lower.includes('vision') || lower.includes('camera')) router.push('/vision')
      if (lower.includes('course') || lower.includes('product')) router.push('/product')
      if (lower.includes('video')) router.push('/video')
    }, [router]),
  })

  // Wire serial enqueue into speech hook
  useEffect(() => {
    setEnqueue(enqueue)
  }, [enqueue, setEnqueue])

  const toggle = () => {
    if (isListening) stopListening()
    else startListening()
  }

  // Don't render on /captions — that page owns the mic directly
  if (pathname === '/captions') return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-6 right-6 z-50 select-none"
    >
      <div className="flex flex-col items-end gap-2">
        {/* Expanded panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-72 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-4 shadow-2xl shadow-black/50"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Voice Assistant
                </p>
                <Volume2 className="h-3.5 w-3.5 text-white/40" />
              </div>

              {/* Waveform */}
              <div className="flex justify-center my-3">
                <VoiceWaveform active={isListening} className="h-8" />
              </div>

              {/* Status */}
              <div className="text-center mb-3">
                <p className={cn(
                  'text-sm font-medium',
                  isListening ? 'text-green-400' : 'text-white/50'
                )}>
                  {statusMsg}
                </p>
              </div>

              {/* Last command */}
              {lastCommand && (
                <div className="rounded-xl bg-white/5 border border-white/8 px-3 py-2 mb-3">
                  <p className="text-xs text-white/40 mb-0.5">Last command</p>
                  <p className="text-sm text-purple-300 font-medium truncate">
                    &quot;{lastCommand}&quot;
                  </p>
                </div>
              )}

              {/* Error */}
              {micError && (
                <div className="rounded-xl bg-red-600/10 border border-red-500/20 px-3 py-2 mb-3">
                  <p className="text-xs text-red-300">{micError}</p>
                </div>
              )}

              {/* Commands hint */}
              <div className="rounded-xl bg-white/3 border border-white/5 px-3 py-2">
                <p className="text-xs text-white/30 mb-1">Say:</p>
                <div className="flex flex-wrap gap-1">
                  {['open captions', 'open vision', 'go home', 'open video'].map((cmd) => (
                    <span
                      key={cmd}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-white/8 bg-white/4 text-white/40"
                    >
                      {cmd}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom row: expand toggle + mic */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="h-9 w-9 rounded-xl border border-white/10 bg-black/60 backdrop-blur flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-all"
            aria-label="Toggle voice panel"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>

          {/* Mic button */}
          <motion.button
            onClick={toggle}
            className={cn(
              'h-12 w-12 rounded-2xl flex items-center justify-center shadow-xl transition-all',
              isListening
                ? 'bg-gradient-to-br from-green-600 to-emerald-600 shadow-green-900/40'
                : 'bg-gradient-to-br from-purple-600 to-blue-600 shadow-purple-900/40'
            )}
            whileTap={{ scale: 0.92 }}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {/* Pulse ring when active */}
            {isListening && (
              <motion.span
                className="absolute inset-0 rounded-2xl bg-green-500/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            {isListening ? (
              <MicOff className="h-5 w-5 text-white relative z-10" />
            ) : (
              <Mic className="h-5 w-5 text-white relative z-10" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
