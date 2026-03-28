'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'

const MAX_WORDS = 30
const NETWORK_MAX_RETRIES = 10

type EnqueueFn = (text: string) => void

interface UseSpeechOptions {
  onVoiceCommand?: (cmd: string) => void
}

export function useSpeech(options?: UseSpeechOptions) {
  const onVoiceCommandRef = useRef(options?.onVoiceCommand)

  // Read initial preference values — we use refs inside event handlers to avoid stale closures
  const ttsEnabledRef = useRef(useAppStore.getState().ttsEnabled)
  const autoVibrateRef = useRef(useAppStore.getState().autoVibrate)
  const arduinoConnectedRef = useRef(useAppStore.getState().arduinoConnected)
  const enqueueRef = useRef<EnqueueFn | undefined>(undefined)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const shouldListenRef = useRef(false)
  const networkRetryRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)

  // Keep refs in sync
  useEffect(() => { onVoiceCommandRef.current = options?.onVoiceCommand }, [options?.onVoiceCommand])
  useEffect(() =>
    useAppStore.subscribe((s) => {
      ttsEnabledRef.current = s.ttsEnabled
      autoVibrateRef.current = s.autoVibrate
      arduinoConnectedRef.current = s.arduinoConnected
    })
  , [])

  /** Wire in serial enqueue after mount */
  const setEnqueue = useCallback((fn: EnqueueFn) => {
    enqueueRef.current = fn
  }, [])

  // Build the SpeechRecognition instance once on mount
  useEffect(() => {
    const SR =
      (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition

    if (!SR) {
      useAppStore.getState().setStatusMsg('Speech recognition not supported. Use Chrome or Edge.')
      return
    }

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          const finalText = transcript.trim()
          if (!finalText) continue

          // TTS playback
          if (ttsEnabledRef.current && window.speechSynthesis) {
            const utt = new SpeechSynthesisUtterance(finalText)
            utt.rate = 1
            window.speechSynthesis.speak(utt)
          }

          // Auto-vibrate via Arduino
          if (autoVibrateRef.current && arduinoConnectedRef.current && enqueueRef.current) {
            enqueueRef.current(finalText)
          }

          // External voice command handler (e.g. navigation from VoiceAssistant)
          if (onVoiceCommandRef.current) {
            onVoiceCommandRef.current(finalText)
          }

          // Rolling 30-word window — read current value from store, not stale state
          const current = useAppStore.getState().windowText
          const words = [
            ...current.split(/\s+/).filter(Boolean),
            ...finalText.split(/\s+/).filter(Boolean),
          ]
          useAppStore.getState().setWindowText(words.slice(-MAX_WORDS).join(' '))
          useAppStore.getState().setInterimText('')
        } else {
          interim += transcript
        }
      }

      // RAF-throttle interim updates (recognition fires 10-20×/s)
      if (interim) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          useAppStore.getState().setInterimText(interim)
          rafRef.current = null
        })
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return

      if (event.error === 'network') {
        networkRetryRef.current += 1
        if (shouldListenRef.current && networkRetryRef.current <= NETWORK_MAX_RETRIES) {
          useAppStore.getState().setStatusMsg(
            `Reconnecting… (${networkRetryRef.current}/${NETWORK_MAX_RETRIES})`
          )
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
          // Exponential backoff: 1s, 2s, 4s, 8s … capped at 15s
          const delay = Math.min(1000 * 2 ** (networkRetryRef.current - 1), 15000)
          retryTimerRef.current = setTimeout(() => {
            retryTimerRef.current = null
            if (shouldListenRef.current) {
              try { recognition.start() } catch { /* already starting */ }
            }
          }, delay)
          return
        }
        // Retries exhausted — stop cleanly so onend doesn't loop
        shouldListenRef.current = false
        useAppStore.getState().setIsListening(false)
        useAppStore.getState().setMicError(
          'Speech service unreachable — check your internet connection.'
        )
        useAppStore.getState().setStatusMsg('Network error')
        return
      }

      networkRetryRef.current = 0
      const msgs: Record<string, string> = {
        'not-allowed': 'Microphone access denied. Allow mic in browser settings.',
        'audio-capture': 'No microphone found. Connect a mic and try again.',
      }
      useAppStore.getState().setMicError(msgs[event.error] ?? `Recognition error: ${event.error}`)
      useAppStore.getState().setStatusMsg('Error')
    }

    recognition.onend = () => {
      // Auto-restart if still should be listening (and no pending retry timer)
      if (shouldListenRef.current && !retryTimerRef.current) {
        try { recognition.start() } catch { /* ignore */ }
      } else if (!shouldListenRef.current) {
        useAppStore.getState().setIsListening(false)
        useAppStore.getState().setStatusMsg('Stopped')
        useAppStore.getState().setInterimText('')
      }
    }

    recognitionRef.current = recognition

    return () => {
      shouldListenRef.current = false
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      recognition.stop()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) return
    useAppStore.getState().setMicError('')
    networkRetryRef.current = 0
    if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
    } catch (err) {
      const e = err as { name?: string }
      useAppStore.getState().setMicError(
        e?.name === 'NotAllowedError'
          ? 'Microphone denied. Allow access in browser settings.'
          : 'Could not access microphone. Check device settings.'
      )
      return
    }

    shouldListenRef.current = true
    try {
      recognitionRef.current.start()
      useAppStore.getState().setIsListening(true)
      useAppStore.getState().setStatusMsg('Listening…')
    } catch { /* already started */ }
  }, [])

  const stopListening = useCallback(() => {
    shouldListenRef.current = false
    recognitionRef.current?.stop()
    useAppStore.getState().setIsListening(false)
    useAppStore.getState().setStatusMsg('Stopped')
    useAppStore.getState().setInterimText('')
  }, [])

  return { startListening, stopListening, setEnqueue }
}
