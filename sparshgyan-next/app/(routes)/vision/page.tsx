'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Camera, CameraOff, AlertCircle, Eye, Layers } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { GestureControl } from '@/components/accessibility/GestureControl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function VisionPage() {
  const gestureActive = useAppStore((s) => s.gestureActive)
  const gestureStatus = useAppStore((s) => s.gestureStatus)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState('')

  const startCamera = useCallback(async () => {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOn(true)
    } catch (err) {
      const e = err as { name?: string }
      setCameraError(
        e?.name === 'NotAllowedError'
          ? 'Camera access denied. Allow camera in browser settings.'
          : 'Could not start camera. Check device settings.'
      )
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
  }, [])

  // Auto-start camera on mount
  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  return (
    <div className="min-h-screen bg-[#050508] pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl font-black text-white">Vision Assist</h1>
            {gestureActive && (
              <Badge variant="success">
                <span className="mr-1">●</span> Gesture Service Active
              </Badge>
            )}
          </div>
          <p className="text-sm text-white/40">
            Webcam gesture recognition powered by your local Python service
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Camera preview */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl border border-white/8 bg-black overflow-hidden">
              {/* Video element */}
              <video
                ref={videoRef}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-300',
                  cameraOn ? 'opacity-100' : 'opacity-0'
                )}
                autoPlay
                playsInline
                muted
              />

              {/* Overlay when camera off */}
              {!cameraOn && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="h-16 w-16 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                    <CameraOff className="h-7 w-7 text-white/25" />
                  </div>
                  <p className="text-white/30 text-sm">Camera starting…</p>
                </div>
              )}

              {/* Error overlay */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-red-950/20">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                  <p className="text-red-300 text-sm max-w-xs text-center">{cameraError}</p>
                  <Button size="sm" onClick={startCamera}>Retry Camera</Button>
                </div>
              )}

              {/* Camera-on indicator */}
              {cameraOn && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-black/60 backdrop-blur-sm px-3 py-1 text-xs text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Camera Live
                  </span>
                </div>
              )}

              {/* Gesture overlay hints */}
              {gestureActive && cameraOn && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-4 right-4 flex flex-col gap-2"
                >
                  {[
                    { label: '✌️ Two fingers', action: 'Open panel' },
                    { label: '☝️ Index up', action: 'Click' },
                  ].map(({ label, action }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs"
                    >
                      <span className="text-white/60">{label}</span>
                      <span className="text-white/30 mx-1.5">→</span>
                      <span className="text-white/50">{action}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Camera controls */}
            <div className="flex items-center gap-3">
              {cameraOn ? (
                <Button variant="outline" onClick={stopCamera} size="sm">
                  <CameraOff className="h-3.5 w-3.5" />
                  Stop Camera
                </Button>
              ) : (
                <Button onClick={startCamera} size="sm">
                  <Camera className="h-3.5 w-3.5" />
                  Start Camera
                </Button>
              )}
            </div>

            {/* Feature explanation cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: Eye, label: 'Object Detection', desc: 'MediaPipe-powered hand landmarks', color: 'text-cyan-400' },
                { icon: Layers, label: 'Screen Overlay', desc: 'Magnifier & focus ring', color: 'text-purple-400' },
                { icon: Camera, label: '30fps Processing', desc: 'Real-time local inference', color: 'text-green-400' },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/6 bg-white/3 p-3 space-y-1.5"
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                  <p className="text-xs font-semibold text-white/80">{label}</p>
                  <p className="text-[11px] text-white/35 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Gesture control + service status */}
          <div className="flex flex-col gap-4">
            <GestureControl />

            {/* Setup instructions */}
            <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5">
              <p className="text-sm font-semibold text-white mb-3">Setup Required</p>
              <ol className="space-y-2.5">
                {[
                  'Install Python 3.10+ with pip',
                  'cd virtual-Mouse && pip install -r requirements.txt',
                  'Start gesture service: python app.py',
                  'Then click "Start Gesture Control" above',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-[10px] text-purple-400 font-bold">
                      {i + 1}
                    </span>
                    <p className="text-xs text-white/50 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Service status */}
            <div className="rounded-2xl border border-white/6 bg-white/2 p-4">
              <p className="text-xs text-white/30 mb-2">Flask Service</p>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'h-2 w-2 rounded-full',
                  gestureStatus === 'running' ? 'bg-green-400 animate-pulse' : 'bg-white/15'
                )} />
                <span className="text-xs text-white/50">
                  {gestureStatus === 'running'
                    ? 'http://localhost:5000 — running'
                    : 'Not connected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
