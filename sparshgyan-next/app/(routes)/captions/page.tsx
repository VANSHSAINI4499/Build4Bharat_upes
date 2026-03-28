'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, RefreshCw, AlignLeft, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useSpeech } from '@/lib/hooks/useSpeech'
import { useSerial } from '@/lib/hooks/useSerial'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ArduinoPanel } from '@/components/accessibility/ArduinoPanel'
import { BrailleDisplay } from '@/components/accessibility/BrailleDisplay'
import { VoiceWaveform } from '@/components/magic/VoiceWaveform'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function CaptionsPage() {
  const isListening = useAppStore((s) => s.isListening)
  const windowText = useAppStore((s) => s.windowText)
  const interimText = useAppStore((s) => s.interimText)
  const statusMsg = useAppStore((s) => s.statusMsg)
  const micError = useAppStore((s) => s.micError)
  const autoScroll = useAppStore((s) => s.autoScroll)
  const ttsEnabled = useAppStore((s) => s.ttsEnabled)

  const { startListening, stopListening, setEnqueue } = useSpeech()
  const { enqueue } = useSerial()

  // Wire serial enqueue into speech hook
  useEffect(() => { setEnqueue(enqueue) }, [enqueue, setEnqueue])

  // Combined caption text for display
  const allText = useMemo(() => {
    if (!interimText) return windowText
    return windowText ? `${windowText} ${interimText}` : interimText
  }, [windowText, interimText])

  // Auto-scroll
  const captionEndRef = useRef<HTMLDivElement>(null)
  const scrollRafRef = useRef<number>(0)

  useEffect(() => {
    if (!autoScroll) return
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current)
    scrollRafRef.current = requestAnimationFrame(() => {
      captionEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      scrollRafRef.current = 0
    })
  }, [allText, autoScroll])

  const clearCaptions = () => {
    useAppStore.getState().setWindowText('')
    useAppStore.getState().setInterimText('')
  }

  const wordCount = windowText.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="min-h-screen bg-[#050508] pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-2xl font-black text-white">Live Captions</h1>
              {isListening && (
                <Badge variant="live">
                  <span className="mr-1">●</span> LIVE
                </Badge>
              )}
            </div>
            <p className="text-sm text-white/40">
              Real-time speech-to-text with haptic Braille output
            </p>
          </div>

          {/* Main mic controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCaptions}
              disabled={!windowText && !interimText}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Clear
            </Button>
            {isListening ? (
              <Button variant="destructive" onClick={() => { stopListening(); toast('Microphone stopped') }} size="lg">
                <MicOff className="h-4 w-4" />
                Stop Listening
              </Button>
            ) : (
              <Button onClick={() => { startListening(); toast.success('Starting microphone…') }} size="lg">
                <Mic className="h-4 w-4" />
                Start Listening
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* ── LEFT: Caption display ───────────────────── */}
          <div className="flex flex-col gap-4">
            {/* Status bar */}
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm px-5 py-3">
              <div className="flex items-center gap-3">
                <VoiceWaveform active={isListening} className="h-6" />
                <span className={cn(
                  'text-sm font-medium',
                  isListening ? 'text-green-400' : 'text-white/40'
                )}>
                  {statusMsg}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/30">
                <span>{wordCount} words</span>
                <span className="h-3 w-px bg-white/10" />
                <span>30-word window</span>
              </div>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {micError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-600/10 px-5 py-3.5"
                >
                  <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-300">{micError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Caption box */}
            <div className="relative flex-1 min-h-[400px] rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden">
              {/* Top fade */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#050508]/80 to-transparent pointer-events-none z-10" />

              <div className="absolute inset-0 overflow-y-auto px-8 py-8 caption-text" aria-live="polite" aria-atomic="false">
                {allText ? (
                  <>
                    {/* Final text */}
                    <p className="text-white/90 leading-relaxed text-xl font-medium whitespace-pre-wrap">
                      {windowText}
                    </p>
                    {/* Interim text */}
                    {interimText && (
                      <p className="text-white/50 italic mt-2 text-lg">
                        {interimText}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-2xl border border-white/8 bg-white/4 flex items-center justify-center mb-4">
                      <Mic className="h-7 w-7 text-white/20" />
                    </div>
                    <p className="text-white/25 text-base">
                      {isListening ? 'Listening… speak now' : 'Press Start Listening to begin'}
                    </p>
                    {!isListening && (
                      <p className="text-white/15 text-sm mt-2">
                        Or say &quot;open captions&quot; from anywhere in the app
                      </p>
                    )}
                  </div>
                )}
                <div ref={captionEndRef} />
              </div>

              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#050508]/80 to-transparent pointer-events-none z-10" />
            </div>

            {/* Toggles bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: autoScroll ? AlignLeft : AlignLeft,
                  label: 'Auto-scroll',
                  checked: autoScroll,
                  onChange: (v: boolean) => useAppStore.getState().setAutoScroll(v),
                  color: 'text-blue-400',
                },
                {
                  icon: ttsEnabled ? Volume2 : VolumeX,
                  label: 'TTS Playback',
                  checked: ttsEnabled,
                  onChange: (v: boolean) => useAppStore.getState().setTtsEnabled(v),
                  color: 'text-cyan-400',
                },
              ].map(({ label, checked, onChange, color, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-white/6 bg-white/3 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-sm text-white/70">{label}</span>
                  </div>
                  <Switch checked={checked} onCheckedChange={onChange} />
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Controls ─────────────────────────── */}
          <div className="flex flex-col gap-4">
            <ArduinoPanel />
            <BrailleDisplay />
          </div>
        </div>
      </div>
    </div>
  )
}
