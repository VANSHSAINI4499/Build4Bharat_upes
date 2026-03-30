'use client'

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  BookOpen,
  ChevronRight,
  MonitorPlay,
  Radio,
  AlertCircle,
  Loader2,
  Subtitles,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useSerial } from '@/lib/hooks/useSerial'
import { ArduinoPanel } from '@/components/accessibility/ArduinoPanel'
import { BrailleDisplay } from '@/components/accessibility/BrailleDisplay'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

/* ── Caption segment type (matches API) ─────────────────────────── */
interface CaptionSegment {
  start: number
  dur: number
  text: string
}

/* ── Course metadata ────────────────────────────────────────────── */
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

const VIDEO_ID = 'Oe_h_M7Drec'


function VideoPageInner() {
  const searchParams = useSearchParams()
  const courseTitle = searchParams.get('course') ?? 'AI for Accessibility'
  const courseMeta = COURSE_META[courseTitle] ?? COURSE_META['AI for Accessibility']

  const videoCaptionMode = useAppStore((s) => s.videoCaptionMode)
  const arduinoConnected = useAppStore((s) => s.arduinoConnected)
  const autoVibrate = useAppStore((s) => s.autoVibrate)

  const { enqueue } = useSerial()

  /* ── Caption fetch state ─────────────────────────────────────── */
  const [captions, setCaptions] = useState<CaptionSegment[]>([])
  const [captionLoading, setCaptionLoading] = useState(false)
  const [captionError, setCaptionError] = useState('')

  /* ── Playback sync state ────────────────────────────────────── */
  const [currentCaption, setCurrentCaption] = useState('')
  const [videoPlaying, setVideoPlaying] = useState(false)
  const lastSentRef = useRef('')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentTimeRef = useRef(0)

  /* ── Transcript accumulator ──────────────────────────────────── */
  const [transcript, setTranscript] = useState<string[]>([])

  /* ── Listen for postMessage from YouTube iframe (for getCurrentTime) ── */
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== 'https://www.youtube.com') return
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        // YouTube sends playerState changes via info delivery
        if (data?.event === 'infoDelivery' && data?.info) {
          if (typeof data.info.currentTime === 'number') {
            currentTimeRef.current = data.info.currentTime
          }
          if (typeof data.info.playerState === 'number') {
            // 1 = PLAYING, 3 = BUFFERING
            setVideoPlaying(data.info.playerState === 1 || data.info.playerState === 3)
          }
        }
        if (data?.event === 'onStateChange') {
          setVideoPlaying(data.info === 1 || data.info === 3)
        }
      } catch {
        // not JSON — ignore
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  /* ── Send "listening" command to YouTube iframe to get time updates ── */
  useEffect(() => {
    if (!videoCaptionMode || !iframeRef.current) return
    // Tell YouTube iframe to send us info updates
    const sendListen = () => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'listening', id: 0 }),
        'https://www.youtube.com',
      )
    }
    // Need to send after iframe loads; re-send periodically to keep alive
    sendListen()
    const id = setInterval(sendListen, 1000)
    return () => clearInterval(id)
  }, [videoCaptionMode])

  /* ── Fetch captions when toggle is turned ON ──────────────────── */
  const fetchCaptions = useCallback(async () => {
    setCaptionLoading(true)
    setCaptionError('')
    try {
      const res = await fetch(`/api/captions?v=${VIDEO_ID}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load captions')
      setCaptions(data.segments as CaptionSegment[])
      toast.success(`Loaded ${data.segments.length} caption segments`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setCaptionError(msg)
      toast.error(`Caption load failed: ${msg}`)
    } finally {
      setCaptionLoading(false)
    }
  }, [])

  /* ── Toggle handler ──────────────────────────────────────────── */
  const handleToggle = useCallback(
    (enabled: boolean) => {
      useAppStore.getState().setVideoCaptionMode(enabled)
      if (enabled) {
        setCurrentCaption('')
        setTranscript([])
        lastSentRef.current = ''
        fetchCaptions()
      } else {
        toast('Caption mode off')
      }
    },
    [fetchCaptions],
  )

  /* ── Poll video time → find matching caption → send to Arduino ─ */
  useEffect(() => {
    if (!videoCaptionMode || !captions.length) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      return
    }

    pollRef.current = setInterval(() => {
      const t = currentTimeRef.current
      if (t === 0) return

      const seg = captions.find((c) => t >= c.start && t < c.start + c.dur)
      if (!seg) return
      if (seg.text === lastSentRef.current) return

      lastSentRef.current = seg.text
      setCurrentCaption(seg.text)

      // Update windowText for BrailleDisplay
      useAppStore.getState().setWindowText(seg.text)

      // Accumulate transcript
      setTranscript((prev) => [...prev, seg.text])

      // Send directly to Arduino tactile device (no mic, no TTS)
      if (arduinoConnected && autoVibrate) {
        enqueue(seg.text)
      }
    }, 250)

    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }
  }, [videoCaptionMode, captions, arduinoConnected, autoVibrate, enqueue])

  /* ── Cleanup on unmount ──────────────────────────────────────── */
  useEffect(() => {
    return () => {
      if (useAppStore.getState().videoCaptionMode) {
        useAppStore.getState().setVideoCaptionMode(false)
      }
    }
  }, [])

  const hasCaption = currentCaption.length > 0

  /* ── RENDER ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#050508] pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px]">
                <Play className="h-2.5 w-2.5 mr-1 fill-current" /> Now Playing
              </Badge>
              {videoCaptionMode && hasCaption && (
                <Badge variant="live"><span className="mr-1">●</span> Captions → Tactile</Badge>
              )}
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4">
            {/* ── Video player ────────────────────────────────────── */}
            <div className="relative rounded-2xl border border-white/8 overflow-hidden bg-black aspect-video">
              <iframe
                ref={iframeRef}
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${VIDEO_ID}?enablejsapi=1&controls=1&rel=0&modestbranding=1`}
                title={courseTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* Caption overlay synced to video playback */}
              <motion.div
                initial={false}
                animate={{
                  opacity: videoCaptionMode && hasCaption ? 1 : 0,
                  y: videoCaptionMode && hasCaption ? 0 : 8,
                }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] text-center pointer-events-none z-10"
              >
                <span className="inline-block rounded-xl bg-black/90 backdrop-blur-md border border-white/10 px-5 py-3 text-white font-medium text-base leading-snug max-w-2xl shadow-2xl">
                  {currentCaption}
                </span>
              </motion.div>

              {/* Live indicator badge on video */}
              {videoCaptionMode && videoPlaying && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 border border-green-500/30">
                  <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] text-green-400 font-medium">Captions → Tactile</span>
                </div>
              )}
            </div>

            {/* ── Caption Mode Toggle Card ─────────────────────── */}
            <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors',
                    videoCaptionMode
                      ? 'bg-purple-600/20 border-purple-500/30'
                      : 'bg-white/5 border-white/10',
                  )}>
                    <Subtitles className={cn('h-5 w-5', videoCaptionMode ? 'text-purple-400' : 'text-white/40')} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Video Captions → Tactile</p>
                    <p className="text-xs text-white/40">
                      {videoCaptionMode
                        ? 'YouTube captions are sent directly to the Braille/tactile device'
                        : 'Toggle ON to extract video captions and output to tactile device'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={videoCaptionMode}
                  onCheckedChange={handleToggle}
                  aria-label="Video Captions to Tactile"
                />
              </div>

              {/* Status panel */}
              <AnimatePresence>
                {videoCaptionMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-white/5">
                      {captionLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                          <span className="text-xs font-medium text-purple-400">Loading captions from YouTube…</span>
                        </>
                      ) : captionError ? (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <span className="text-xs font-medium text-red-400">{captionError}</span>
                        </>
                      ) : captions.length > 0 ? (
                        <>
                          <Radio className="h-4 w-4 text-green-400" />
                          <span className="text-xs font-medium text-green-400">
                            {captions.length} segments loaded — {videoPlaying ? 'playing' : 'play video to start'}
                          </span>
                          {videoPlaying && (
                            <span className="ml-auto">
                              <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <MonitorPlay className="h-4 w-4 text-white/40" />
                          <span className="text-xs font-medium text-white/40">Waiting…</span>
                        </>
                      )}
                    </div>

                    {!arduinoConnected && (
                      <p className="text-xs text-amber-400/70 mt-2">
                        Connect the Arduino in the panel on the right to output captions to the tactile device.
                      </p>
                    )}
                    {arduinoConnected && !autoVibrate && (
                      <p className="text-xs text-amber-400/70 mt-2">
                        Enable &quot;Auto Vibrate&quot; in the Arduino panel to automatically send captions.
                      </p>
                    )}
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

            {/* Full transcript (built from caption segments as they appear) */}
            {transcript.length > 0 && (
              <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-white/30 uppercase tracking-wider font-semibold">Video Transcript</p>
                  <Badge variant="secondary" className="text-[10px]">
                    <Subtitles className="h-2.5 w-2.5 mr-1" /> From YouTube Captions
                  </Badge>
                </div>
                <p className="text-base text-white/70 leading-relaxed">
                  {transcript.join(' ')}
                </p>
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
