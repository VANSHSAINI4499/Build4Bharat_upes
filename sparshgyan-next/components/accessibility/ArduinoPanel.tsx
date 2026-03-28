'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, Wifi, WifiOff, Send, Zap, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useSerial } from '@/lib/hooks/useSerial'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function ArduinoPanel() {
  const arduinoConnected = useAppStore((s) => s.arduinoConnected)
  const autoVibrate = useAppStore((s) => s.autoVibrate)
  const vibrateProgress = useAppStore((s) => s.vibrateProgress)
  const windowText = useAppStore((s) => s.windowText)

  const { connect, disconnect, enqueue } = useSerial()

  const handleSendNow = () => {
    if (!windowText.trim()) return
    enqueue(windowText)
  }

  const toggleAutoVibrate = (checked: boolean) => {
    useAppStore.getState().setAutoVibrate(checked)
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'h-9 w-9 rounded-xl flex items-center justify-center',
            arduinoConnected
              ? 'bg-green-600/20 border border-green-500/30'
              : 'bg-white/5 border border-white/10'
          )}>
            <Cpu className={cn('h-4 w-4', arduinoConnected ? 'text-green-400' : 'text-white/40')} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Haptic Device</p>
            <p className="text-xs text-white/40">Arduino Braille Controller</p>
          </div>
        </div>
        <Badge variant={arduinoConnected ? 'success' : 'secondary'}>
          {arduinoConnected ? (
            <><Wifi className="h-3 w-3 mr-1" />Connected</>
          ) : (
            <><WifiOff className="h-3 w-3 mr-1" />Not Connected</>
          )}
        </Badge>
      </div>

      {/* Connect / Disconnect */}
      {!arduinoConnected ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={connect}
        >
          <Cpu className="h-4 w-4" />
          Connect Arduino (USB)
        </Button>
      ) : (
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={disconnect}
        >
          <WifiOff className="h-3.5 w-3.5" />
          Disconnect
        </Button>
      )}

      {/* Auto Vibrate toggle */}
      {arduinoConnected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between rounded-xl border border-white/6 bg-white/3 px-4 py-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-white/80">Auto Vibrate</span>
            </div>
            <Switch
              checked={autoVibrate}
              onCheckedChange={toggleAutoVibrate}
              aria-label="Auto vibrate toggle"
            />
          </div>

          {/* Progress display */}
          {vibrateProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-green-500/20 bg-green-600/10 px-3 py-2 flex items-center gap-2"
            >
              <span className="text-xs text-green-300 font-mono leading-relaxed">
                {vibrateProgress}
              </span>
            </motion.div>
          )}

          {/* Send Now */}
          <Button
            variant="success"
            className="w-full"
            onClick={handleSendNow}
            disabled={!windowText.trim()}
          >
            <Send className="h-4 w-4" />
            Send Captions Now
          </Button>

          {/* Note */}
          <div className="flex items-start gap-2 rounded-xl bg-white/3 px-3 py-2.5">
            <AlertCircle className="h-3.5 w-3.5 text-white/30 mt-0.5 shrink-0" />
            <p className="text-xs text-white/30 leading-relaxed">
              Each letter is sent with a 2-second delay to match Arduino motor timing (9600 baud).
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
