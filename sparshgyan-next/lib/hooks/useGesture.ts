'use client'

import { useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'

const FLASK_BASE = '/api/gesture'

export function useGesture() {
  const start = useCallback(async () => {
    useAppStore.getState().setGestureStatus('starting')
    try {
      const res = await fetch(`${FLASK_BASE}/start`, { method: 'POST' })
      if (res.ok) {
        useAppStore.getState().setGestureActive(true)
        useAppStore.getState().setGestureStatus('running')
      } else {
        useAppStore.getState().setGestureStatus('error')
      }
    } catch {
      useAppStore.getState().setGestureStatus('error')
    }
  }, [])

  const stop = useCallback(async () => {
    try {
      await fetch(`${FLASK_BASE}/stop`, { method: 'POST' })
    } catch { /* ignore */ }
    useAppStore.getState().setGestureActive(false)
    useAppStore.getState().setGestureStatus('idle')
  }, [])

  const toggle = useCallback(async () => {
    const active = useAppStore.getState().gestureActive
    if (active) { await stop() } else { await start() }
  }, [start, stop])

  return { start, stop, toggle }
}
