'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { resolveDestination, type AgentDestination } from '@/lib/voiceRouting';

type ReadingMode = 'slow' | 'medium' | 'fast';
type ReadingAction = 'start' | 'stop' | 'pause' | 'resume';

const READING_RATE_MAP: Record<ReadingMode, number> = {
  slow: 0.85,
  medium: 1,
  fast: 1.2,
};

type ElevenCallConfig = {
  clientTools?: Record<
    string,
    (params: Record<string, unknown>) => unknown | Promise<unknown>
  >;
  [key: string]: unknown;
};

type ElevenConvaiCallEvent = CustomEvent<{
  config: ElevenCallConfig;
}>;

function isReadingMode(value: unknown): value is ReadingMode {
  return value === 'slow' || value === 'medium' || value === 'fast';
}

function isReadingAction(value: unknown): value is ReadingAction {
  return (
    value === 'start' ||
    value === 'stop' ||
    value === 'pause' ||
    value === 'resume'
  );
}

function isAgentDestination(value: unknown): value is AgentDestination {
  return (
    value === 'home' ||
    value === 'login' ||
    value === 'ai_course' ||
    value === 'vision_assist' ||
    value === 'live_captions'
  );
}

export function ElevenLabsWidget() {
  const router = useRouter();
  const widgetRef = useRef<HTMLElement | null>(null);
  const [isReaderActive, setIsReaderActive] = useState(false);
  const readerStateRef = useRef<{
    chunks: string[];
    index: number;
    active: boolean;
    paused: boolean;
  }>({
    chunks: [],
    index: 0,
    active: false,
    paused: false,
  });

  const getReadablePageText = useCallback(() => {
    const root = document.querySelector('main') ?? document.body;
    const text = root?.textContent ?? '';

    return text
      .replace(/\s+/g, ' ')
      .replace(/\u00a0/g, ' ')
      .trim();
  }, []);

  const chunkText = useCallback((text: string, maxLength = 220) => {
    if (!text) return [];

    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      const next = current ? `${current} ${sentence}` : sentence;
      if (next.length <= maxLength) {
        current = next;
        continue;
      }

      if (current) chunks.push(current);
      if (sentence.length <= maxLength) {
        current = sentence;
        continue;
      }

      // Handle very long runs without punctuation.
      let remaining = sentence;
      while (remaining.length > maxLength) {
        chunks.push(remaining.slice(0, maxLength));
        remaining = remaining.slice(maxLength).trimStart();
      }
      current = remaining;
    }

    if (current) chunks.push(current);
    return chunks;
  }, []);

  const stopPageReader = useCallback(() => {
    const state = readerStateRef.current;
    state.active = false;
    state.paused = false;
    state.chunks = [];
    state.index = 0;
    setIsReaderActive(false);
    window.speechSynthesis?.cancel();
    useAppStore.getState().setStatusMsg('Reading stopped');
  }, []);

  const speakFromQueue = useCallback(() => {
    const state = readerStateRef.current;
    const synth = window.speechSynthesis;

    if (!synth || !state.active || state.paused) return;
    if (state.index >= state.chunks.length) {
      state.active = false;
      setIsReaderActive(false);
      useAppStore.getState().setStatusMsg('Finished reading');
      return;
    }

    const text = state.chunks[state.index];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = useAppStore.getState().ttsRate;

    utterance.onstart = () => {
      useAppStore.getState().setStatusMsg('Reading page…');
    };

    utterance.onend = () => {
      if (!state.active || state.paused) return;
      state.index += 1;
      speakFromQueue();
    };

    utterance.onerror = () => {
      if (!state.active || state.paused) return;
      state.index += 1;
      speakFromQueue();
    };

    synth.speak(utterance);
  }, []);

  const setReadingStyle = useCallback(
    async (params: Record<string, unknown>) => {
      const mode = params.mode;

      if (!isReadingMode(mode)) {
        throw new Error('Invalid mode. Expected one of: slow, medium, fast.');
      }

      const rate = READING_RATE_MAP[mode];
      const store = useAppStore.getState();
      store.setReadingMode(mode);
      store.setTtsRate(rate);
      store.setStatusMsg(`Reading style set to ${mode}`);
      toast.success(`Reading style: ${mode}`);

      const state = readerStateRef.current;
      if (state.active && !state.paused) {
        // Restart current chunk so the updated rate applies immediately.
        window.speechSynthesis.cancel();
        speakFromQueue();
      }

      return {
        ok: true,
        mode,
        ttsRate: rate,
      };
    },
    [speakFromQueue],
  );

  const controlReading = useCallback(
    async (params: Record<string, unknown>) => {
      const action = params.action;

      if (!isReadingAction(action)) {
        throw new Error(
          'Invalid action. Expected one of: start, stop, pause, resume.',
        );
      }

      const state = readerStateRef.current;
      const synth = window.speechSynthesis;
      if (!synth)
        throw new Error('Speech synthesis is not supported in this browser.');

      if (action === 'start') {
        const text = getReadablePageText();
        if (!text) throw new Error('No readable content found on this page.');

        const chunks = chunkText(text);
        if (!chunks.length)
          throw new Error('No readable content found on this page.');

        window.speechSynthesis.cancel();
        state.chunks = chunks;
        state.index = 0;
        state.active = true;
        state.paused = false;
        setIsReaderActive(true);
        speakFromQueue();
      }

      if (action === 'pause') {
        if (
          state.active &&
          !state.paused &&
          (synth.speaking || synth.pending)
        ) {
          state.paused = true;
          synth.pause();
          useAppStore.getState().setStatusMsg('Reading paused');
        }
      }

      if (action === 'resume') {
        if (state.active && state.paused) {
          state.paused = false;
          synth.resume();
          useAppStore.getState().setStatusMsg('Reading page…');

          // Some browsers resume unreliably after pauses; restart queue if needed.
          if (!synth.speaking && !synth.pending) {
            speakFromQueue();
          }
        }
      }

      if (action === 'stop') {
        stopPageReader();
      }

      return {
        ok: true,
        action,
        status: useAppStore.getState().statusMsg,
      };
    },
    [chunkText, getReadablePageText, speakFromQueue, stopPageReader],
  );

  const navigatePage = useCallback(
    async (params: Record<string, unknown>) => {
      const destination = params.destination;

      if (!isAgentDestination(destination)) {
        throw new Error('Invalid destination.');
      }

      const resolved = resolveDestination(destination);
      router.push(resolved.path);

      if (resolved.fallback) {
        toast(resolved.message);
      } else {
        toast.success(resolved.message);
      }

      return {
        ok: true,
        destination,
        path: resolved.path,
        fallback: resolved.fallback,
        message: resolved.message,
      };
    },
    [router],
  );

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    const onCall = (event: Event) => {
      const callEvent = event as ElevenConvaiCallEvent;
      const nextConfig = callEvent.detail?.config;
      if (!nextConfig) return;

      nextConfig.clientTools = {
        ...(nextConfig.clientTools ?? {}),
        set_reading_style: setReadingStyle,
        control_reading: controlReading,
        navigate_page: navigatePage,
      };
    };

    widget.addEventListener('elevenlabs-convai:call', onCall);

    return () => {
      widget.removeEventListener('elevenlabs-convai:call', onCall);
    };
  }, [controlReading, navigatePage, setReadingStyle]);

  useEffect(() => {
    return () => {
      stopPageReader();
    };
  }, [stopPageReader]);

  return (
    <>
      <elevenlabs-convai
        ref={(node) => {
          widgetRef.current = node as unknown as HTMLElement | null;
        }}
        agent-id="agent_4501kmtgxcy8ehn8dhnrx7fh8e5n"
      />
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="lazyOnload"
      />

      {isReaderActive && (
        <button
          type="button"
          onClick={stopPageReader}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded-full border border-red-400/30 bg-red-500/90 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/40 backdrop-blur-sm hover:bg-red-500 transition-colors"
          aria-label="Stop reading"
        >
          Stop Reading
        </button>
      )}
    </>
  );
}
