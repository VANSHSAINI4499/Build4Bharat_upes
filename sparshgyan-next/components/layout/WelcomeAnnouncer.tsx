'use client'

import { useEffect, useRef } from 'react'

const WELCOME_MESSAGE =
  'Welcome to SparshGyan. Accessibility without limits. Use voice commands or gestures to navigate.'

export function WelcomeAnnouncer() {
  const spoken = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const speak = () => {
      if (spoken.current) return
      spoken.current = true

      // Cancel anything queued & wait for voices to load
      window.speechSynthesis.cancel()

      const fire = () => {
        const utterance = new SpeechSynthesisUtterance(WELCOME_MESSAGE)
        utterance.lang = 'en-US'
        utterance.rate = 0.95
        utterance.pitch = 1
        utterance.volume = 1
        window.speechSynthesis.speak(utterance)
      }

      // Chrome lazily loads voices — wait if needed
      if (window.speechSynthesis.getVoices().length > 0) {
        fire()
      } else {
        window.speechSynthesis.addEventListener('voiceschanged', fire, { once: true })
      }
    }

    // Try speaking immediately
    speak()

    // Fallback: if browser blocked autoplay, speak on first user interaction
    if (!spoken.current) {
      const onInteraction = () => {
        speak()
        cleanup()
      }
      const cleanup = () => {
        window.removeEventListener('click', onInteraction)
        window.removeEventListener('keydown', onInteraction)
        window.removeEventListener('touchstart', onInteraction)
      }
      window.addEventListener('click', onInteraction, { once: true })
      window.addEventListener('keydown', onInteraction, { once: true })
      window.addEventListener('touchstart', onInteraction, { once: true })
      return cleanup
    }
  }, [])

  // Invisible live region for screen readers
  return (
    <div aria-live="assertive" aria-atomic="true" className="sr-only">
      {WELCOME_MESSAGE}
    </div>
  )
}
