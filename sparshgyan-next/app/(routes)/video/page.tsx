'use client'

import React, { useMemo, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Volume2, VolumeX, Mic, MicOff, BookOpen, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useSpeech } from '@/lib/hooks/useSpeech'
import { useSerial } from '@/lib/hooks/useSerial'
import { ArduinoPanel } from '@/components/accessibility/ArduinoPanel'
import { BrailleDisplay } from '@/components/accessibility/BrailleDisplay'
import { VoiceWaveform } from '@/components/magic/VoiceWaveform'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

const COURSE_META: Record<string, { description: string; level: string; duration: string }> = {
  'AI for Accessibility': {
    description: 'Learn how AI helps people with disabilities — from vision assistance to speech recognition.',
    level: 'Beginner',
    duration: '2h 30m',
  },
  'Computer Vision Basics': {
    description: 'Understand gesture recognition systems, hand tracking, and MediaPipe-powered hands-free control.',
    level: 'Intermediate',
    duration: '3h',
  },
  'Speech Recognition Systems': {
    description: 'Build real-time voice applications using Web Speech API and live transcription techniques.',
    level: 'Advanced',
    duration: '4h',
  },
}

function VideoPageInner() {
  const searchParams = useSearchParams()
  const courseTitle = searchParams.get('course') ?? 'AI for Accessibility'
  const courseMeta = COURSE_META[courseTitle] ?? COURSE_META['AI for Accessibility']

  const isListening = useAppStore((s) => s.isListening)
  const windowText = useAppStore((s) => s.windowText)
  const interimText = useAppStore((s) => s.interimText)
  const ttsEnabled = useAppStore((s) => s.ttsEnabled)

  const { startListening, stopListening, setEnqueue } = useSpeech()
  const { enqueue } = useSerial()

  useEffect(() => { setEnqueue(enqueue) }, [enqueue, setEnqueue])

  const displayText = useMemo(
    () => (interimText ? `${windowText} ${interimText}` : windowText),
    [windowText, interimText]
  )

  const captionOverlay = useMemo(() => {
    if (!displayText) return ''
    const words = displayText.trim().split(/\s+/)
    return words.slice(-12).join(' ')
  }, [displayText])

  return (
    <div className="min-h-screen bg-[#050508] pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px]">
                <Play className="h-2.5 w-2.5 mr-1 fill-current" /> Now Playing
              </Badge>
            </div>
            <h1 className="text-2xl font-black text-white">{courseTitle}</h1>
            <p className="text-sm text-white/40 mt-0.5 max-w-xl">{courseMeta.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-white/30">Level</p>
              <p className="text-sm font-semibold text-white">{courseMeta.level}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-white/30">Duration</p>
              <p className="text-sm font-semibold text-white">{courseMeta.duration}</p>
            </div>
            {isListening && <Badge variant="live"><span className="mr-1">●</span> Captions Live</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Video + captions */}
          <div className="space-y-4">
            {/* Video player card */}
            <div className="relative rounded-2xl border border-white/8 overflow-hidden bg-black aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/Oe_h_M7Drec?controls=1&rel=0&modestbranding=1&color=white"
                title={courseTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* Caption overlay */}
              <AnimatePresence>
                {captionOverlay && (
                  <motion.div
                    key={captionOverlay}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] text-center"
                  >
                    <span className="inline-block rounded-xl bg-black/85 backdrop-blur-sm border border-white/10 px-5 py-2.5 text-white font-medium text-base leading-snug max-w-2xl">
                      {captionOverlay}
                      {interimText && (
                        <span className="text-white/50 italic"> {interimText.split(/\s+/).slice(-4).join(' ')}</span>
                      )}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Course info strip */}
            <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{courseTitle}</p>
                  <p className="text-xs text-white/40 mt-0.5">{courseMeta.description}</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0" onClick={() => toast.success('Lesson marked complete!')}>
                  Mark Complete <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Mic controls for live captions */}
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm px-5 py-4">
              <div className="flex items-center gap-3">
                <VoiceWaveform active={isListening} className="h-6" />
                <div>
                  <p className="text-sm font-medium text-white">Live Captions</p>
                  <p className="text-xs text-white/40">
                    {isListening ? 'Transcribing audio…' : 'Narrate out loud to generate captions'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {ttsEnabled ? (
                    <Volume2 className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-white/30" />
                  )}
                  <Switch
                    checked={ttsEnabled}
                    onCheckedChange={(v) => useAppStore.getState().setTtsEnabled(v)}
                    aria-label="TTS playback"
                  />
                </div>
                {isListening ? (
                  <Button size="sm" variant="destructive" onClick={() => { stopListening(); toast('Captions stopped') }}>
                    <MicOff className="h-3.5 w-3.5" /> Stop
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => { startListening(); toast.success('Live captions started') }}>
                    <Mic className="h-3.5 w-3.5" /> Start Captions
                  </Button>
                )}
              </div>
            </div>

            {/* Full transcript */}
            {windowText && (
              <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5">
                <p className="text-xs text-white/30 mb-3 uppercase tracking-wider font-semibold">Transcript</p>
                <p className="text-base text-white/70 leading-relaxed caption-text">{windowText}</p>
                {interimText && (
                  <p className="text-sm text-white/30 italic mt-1">{interimText}</p>
                )}
              </div>
            )}
          </div>

          {/* Right: accessibility panels */}
          <div className="flex flex-col gap-4">
            <ArduinoPanel />
            <BrailleDisplay />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VideoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050508] pt-24 flex items-center justify-center">
        <p className="text-white/40">Loading video…</p>
      </div>
    }>
      <VideoPageInner />
    </Suspense>
  )
}
