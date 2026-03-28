'use client'

import { useRef, useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'

const CHAR_DELAY_MS = 2000 // Arduino needs ~2000 ms to vibrate one character

export function useSerial() {
  const portRef = useRef<SerialPort | null>(null)
  const vibrateQueueRef = useRef<string[]>([])
  const vibratingRef = useRef(false)

  // Send a single character byte over the serial port
  const sendChar = useCallback(async (char: string) => {
    if (!portRef.current) return
    const encoder = new TextEncoder()
    const writer = portRef.current.writable.getWriter()
    try {
      await writer.write(encoder.encode(char))
    } finally {
      writer.releaseLock()
    }
  }, [])

  // Drain the word queue letter-by-letter — only one loop runs at a time
  const drainQueue = useCallback(async () => {
    if (vibratingRef.current) return
    vibratingRef.current = true

    while (vibrateQueueRef.current.length > 0) {
      const word = vibrateQueueRef.current.shift()!
      const letters = word.toUpperCase().replace(/[^A-Z]/g, '')

      for (let i = 0; i < letters.length; i++) {
        if (!portRef.current) break
        useAppStore.getState().setVibrateProgress(
          `📳 ${letters[i]} (${i + 1}/${letters.length}) — "${word}"`
        )
        await sendChar(letters[i])
        await new Promise<void>((r) => setTimeout(r, CHAR_DELAY_MS))
      }
    }

    useAppStore.getState().setVibrateProgress('')
    vibratingRef.current = false
  }, [sendChar])

  // Add text to the queue and start draining
  const enqueue = useCallback(
    (text: string) => {
      if (!portRef.current) return
      const words = text.trim().split(/\s+/).filter(Boolean)
      vibrateQueueRef.current.push(...words)
      drainQueue()
    },
    [drainQueue]
  )

  // Open a Web Serial port at 9600 baud
  const connect = useCallback(async () => {
    if (!('serial' in navigator)) {
      alert('Web Serial API not supported. Use Chrome or Edge.')
      return
    }
    try {
      const port = await navigator.serial.requestPort()
      await port.open({ baudRate: 9600 })
      portRef.current = port
      useAppStore.getState().setArduinoConnected(true)
    } catch {
      // User cancelled the picker — silently ignore
    }
  }, [])

  // Close port and reset all queue state
  const disconnect = useCallback(async () => {
    vibrateQueueRef.current = []
    vibratingRef.current = false

    if (portRef.current) {
      try { await portRef.current.close() } catch { /* ignore */ }
      portRef.current = null
    }

    useAppStore.getState().setArduinoConnected(false)
    useAppStore.getState().setVibrateProgress('')
    useAppStore.getState().setAutoVibrate(false)
  }, [])

  // Send all current caption text to the Arduino on demand
  const sendNow = useCallback(
    (text: string) => { if (text) enqueue(text) },
    [enqueue]
  )

  return { connect, disconnect, enqueue, sendNow }
}
