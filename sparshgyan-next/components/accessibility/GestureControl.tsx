'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Hand, Play, Square, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useGesture } from '@/lib/hooks/useGesture'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  idle: { icon: Hand, color: 'text-white/40', bg: 'bg-white/5 border-white/10', badge: 'secondary' as const, label: 'Idle' },
  starting: { icon: Loader2, color: 'text-yellow-400', bg: 'bg-yellow-600/10 border-yellow-500/20', badge: 'warning' as const, label: 'Starting…' },
  running: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-600/10 border-green-500/20', badge: 'success' as const, label: 'Running' },
  error: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-600/10 border-red-500/20', badge: 'destructive' as const, label: 'Error' },
}

export function GestureControl() {
  const gestureActive = useAppStore((s) => s.gestureActive)
  const gestureStatus = useAppStore((s) => s.gestureStatus)
  const { start, stop } = useGesture()

  const cfg = STATUS_CONFIG[gestureStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.idle
  const StatusIcon = cfg.icon

  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'h-9 w-9 rounded-xl flex items-center justify-center border',
            gestureActive ? 'bg-cyan-600/20 border-cyan-500/30' : 'bg-white/5 border-white/10'
          )}>
            <Hand className={cn('h-4 w-4', gestureActive ? 'text-cyan-400' : 'text-white/40')} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Gesture Control</p>
            <p className="text-xs text-white/40">Webcam-based hand recognition</p>
          </div>
        </div>
        <Badge variant={cfg.badge}>
          <StatusIcon className={cn('h-3 w-3 mr-1', gestureStatus === 'starting' && 'animate-spin')} />
          {cfg.label}
        </Badge>
      </div>

      {/* Status ring */}
      <div className="flex justify-center py-2">
        <div className={cn('relative h-20 w-20 rounded-full border-2 flex items-center justify-center transition-all duration-300', cfg.bg)}>
          {gestureActive && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <StatusIcon className={cn('h-8 w-8 transition-colors duration-300', cfg.color, gestureStatus === 'starting' && 'animate-spin')} />
        </div>
      </div>

      {/* Action button */}
      {gestureActive ? (
        <Button variant="destructive" className="w-full" onClick={stop}>
          <Square className="h-4 w-4" />
          Stop Gesture Service
        </Button>
      ) : (
        <Button variant="cyan" className="w-full" onClick={start}>
          <Play className="h-4 w-4" />
          Start Gesture Control
        </Button>
      )}

      {/* Instructions */}
      <div className="rounded-xl bg-white/3 border border-white/5 p-3 space-y-1.5">
        <p className="text-xs font-medium text-white/50">Gesture Commands:</p>
        {[
          ['✌️ Two fingers up', 'Open accessibility panel'],
          ['☝️ One finger point', 'Click / select'],
          ['✊ Fist', 'Close / go back'],
        ].map(([gesture, action]) => (
          <div key={gesture} className="flex items-center justify-between">
            <span className="text-xs text-white/35">{gesture}</span>
            <span className="text-xs text-white/25">{action}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
