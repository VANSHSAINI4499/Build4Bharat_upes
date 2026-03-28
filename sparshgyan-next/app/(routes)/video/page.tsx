'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Volume2, VolumeX, Mic, MicOff, Maximize2 } from 'lucide-react'
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

export default function VideoPage() {
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

  // Last two "sentences" for the overlay
  const captionOverlay = useMemo(() => {
    if (!displayText) return ''
    const words = displayText.trim().split(/\s+/)
    return words.slice(-12).join(' ')
  }, [displayText])

  return (
    <div className="min-h-screen bg-[#050508] pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Video Lessons</h1>
            <p className="text-sm text-white/40">Watch with real-time captions and haptic output</p>
          </div>
          {isListening && <Badge variant="live"><span className="mr-1">●</span> Captions Live</Badge>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Video + captions */}
          <div className="space-y-4">
            {/* Video player card */}
            <div className="relative rounded-2xl border border-white/8 overflow-hidden bg-black aspect-video">
              {/* Embed placeholder — swap src for a real video */}
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&rel=0&modestbranding=1"
                title="Course video"
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
                    <span className="inline-block rounded-xl bg-black/80 backdrop-blur-sm border border-white/10 px-5 py-2.5 text-white font-medium text-base leading-snug max-w-2xl">
                      {captionOverlay}
                      {interimText && (
                        <span className="text-white/50 italic"> {interimText.split(/\s+/).slice(-4).join(' ')}</span>
                      )}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
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
                  <Button size="sm" variant="destructive" onClick={stopListening}>
                    <MicOff className="h-3.5 w-3.5" /> Stop
                  </Button>
                ) : (
                  <Button size="sm" onClick={startListening}>
                    <Mic className="h-3.5 w-3.5" /> Start Captions
                  </Button>
                )}
              </div>
            </div>

            {/* Full transcript */}
            {windowText && (
              <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5">
                <p className="text-xs text-white/30 mb-3 uppercase tracking-wider font-semibold">Transcript</p>
                <p className="text-sm text-white/70 leading-relaxed caption-text">{windowText}</p>
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
