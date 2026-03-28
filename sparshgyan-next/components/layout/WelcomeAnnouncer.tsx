'use client';

import { useEffect, useRef } from 'react';

const ACCESSIBLE_STATUS_MESSAGE = 'SparshGyan loaded.';

export function WelcomeAnnouncer() {
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const playOpenChime = async (): Promise<boolean> => {
      if (hasPlayed.current) return true;

      const AudioContextCtor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextCtor) return false;

      const ctx = new AudioContextCtor();
      try {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        if (ctx.state !== 'running') {
          void ctx.close();
          return false;
        }

        const now = ctx.currentTime;

        const master = ctx.createGain();
        master.gain.value = 0.9;
        master.connect(ctx.destination);

        const notes = [
          { at: 0.0, dur: 0.3, hz: 523.25 },
          { at: 0.26, dur: 0.34, hz: 659.25 },
          { at: 0.54, dur: 0.38, hz: 783.99 },
          { at: 0.86, dur: 0.52, hz: 1046.5 },
        ];

        for (const note of notes) {
          const oscMain = ctx.createOscillator();
          const oscHarm = ctx.createOscillator();
          const noteGain = ctx.createGain();

          oscMain.type = 'triangle';
          oscMain.frequency.value = note.hz;

          oscHarm.type = 'sine';
          oscHarm.frequency.value = note.hz * 2;

          const startAt = now + note.at;
          const peakAt = startAt + 0.04;
          const endAt = startAt + note.dur;

          noteGain.gain.setValueAtTime(0.0001, startAt);
          noteGain.gain.exponentialRampToValueAtTime(0.22, peakAt);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, endAt);

          oscMain.connect(noteGain);
          oscHarm.connect(noteGain);
          noteGain.connect(master);

          oscMain.start(startAt);
          oscHarm.start(startAt);
          oscMain.stop(endAt);
          oscHarm.stop(endAt);
        }

        hasPlayed.current = true;

        window.setTimeout(() => {
          void ctx.close();
        }, 2200);

        return true;
      } catch {
        void ctx.close();
        return false;
      }
    };

    const onInteraction = () => {
      void playOpenChime().then((didPlay) => {
        if (didPlay) {
          cleanup();
        }
      });
    };

    const cleanup = () => {
      window.removeEventListener('click', onInteraction);
      window.removeEventListener('keydown', onInteraction);
      window.removeEventListener('touchstart', onInteraction);
      window.removeEventListener('pointerdown', onInteraction);
      window.removeEventListener('mousemove', onInteraction);
      window.removeEventListener('scroll', onInteraction);
    };

    // Try immediate play first.
    void playOpenChime().then((didPlay) => {
      if (didPlay) {
        cleanup();
      }
    });

    // If autoplay is blocked, first interaction will play the chime.
    window.addEventListener('click', onInteraction);
    window.addEventListener('keydown', onInteraction);
    window.addEventListener('touchstart', onInteraction);
    window.addEventListener('pointerdown', onInteraction);
    window.addEventListener('mousemove', onInteraction, { once: true });
    window.addEventListener('scroll', onInteraction, { once: true });

    return cleanup;
  }, []);

  // Invisible live region for screen readers
  return (
    <div aria-live="assertive" aria-atomic="true" className="sr-only">
      {ACCESSIBLE_STATUS_MESSAGE}
    </div>
  );
}
