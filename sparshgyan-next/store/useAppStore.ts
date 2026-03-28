import { create } from 'zustand';

export type GestureStatus = 'idle' | 'starting' | 'running' | 'error';
export type ReadingMode = 'slow' | 'medium' | 'fast';

interface AppState {
  // ── Captions / Speech ──────────────────────────────────────────────────────
  windowText: string; // Rolling 30-word finalised text
  interimText: string; // Live partial transcript
  isListening: boolean;
  statusMsg: string;
  micError: string;

  // ── Arduino / Tactile ──────────────────────────────────────────────────────
  arduinoConnected: boolean;
  autoVibrate: boolean;
  vibrateProgress: string;

  // ── Gesture / Virtual Mouse ────────────────────────────────────────────────
  gestureActive: boolean;
  gestureStatus: GestureStatus;

  // ── UI Preferences ─────────────────────────────────────────────────────────
  autoScroll: boolean;
  showBraille: boolean;
  ttsEnabled: boolean;
  readingMode: ReadingMode;
  ttsRate: number;

  // ── Video Caption Mode ─────────────────────────────────────────────────────
  videoCaptionMode: boolean;

  // ── Accessibility Score (AI-like indicator) ────────────────────────────────
  accessibilityScore: number;

  // ── Setters ────────────────────────────────────────────────────────────────
  setWindowText: (text: string) => void;
  setInterimText: (text: string) => void;
  setIsListening: (v: boolean) => void;
  setStatusMsg: (msg: string) => void;
  setMicError: (err: string) => void;
  setArduinoConnected: (v: boolean) => void;
  setAutoVibrate: (v: boolean) => void;
  setVibrateProgress: (v: string) => void;
  setGestureActive: (v: boolean) => void;
  setGestureStatus: (s: GestureStatus) => void;
  toggleAutoScroll: () => void;
  toggleShowBraille: () => void;
  toggleTts: () => void;
  setAutoScroll: (v: boolean) => void;
  setShowBraille: (v: boolean) => void;
  setTtsEnabled: (v: boolean) => void;
  setReadingMode: (mode: ReadingMode) => void;
  setTtsRate: (rate: number) => void;
  setVideoCaptionMode: (v: boolean) => void;
  clearCaptions: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // State
  windowText: '',
  interimText: '',
  isListening: false,
  statusMsg: 'Ready',
  micError: '',
  arduinoConnected: false,
  autoVibrate: false,
  vibrateProgress: '',
  gestureActive: false,
  gestureStatus: 'idle',
  autoScroll: true,
  showBraille: false,
  ttsEnabled: false,
  readingMode: 'medium',
  ttsRate: 1,
  videoCaptionMode: false,
  accessibilityScore: 72,

  // Actions
  setWindowText: (text) => set({ windowText: text }),
  setInterimText: (text) => set({ interimText: text }),
  setIsListening: (v) => set({ isListening: v }),
  setStatusMsg: (msg) => set({ statusMsg: msg }),
  setMicError: (err) => set({ micError: err }),
  setArduinoConnected: (v) => set({ arduinoConnected: v }),
  setAutoVibrate: (v) => set({ autoVibrate: v }),
  setVibrateProgress: (v) => set({ vibrateProgress: v }),
  setGestureActive: (v) => set({ gestureActive: v }),
  setGestureStatus: (s) => set({ gestureStatus: s }),
  toggleAutoScroll: () => set((s) => ({ autoScroll: !s.autoScroll })),
  toggleShowBraille: () => set((s) => ({ showBraille: !s.showBraille })),
  toggleTts: () => set((s) => ({ ttsEnabled: !s.ttsEnabled })),
  setAutoScroll: (v) => set({ autoScroll: v }),
  setShowBraille: (v) => set({ showBraille: v }),
  setTtsEnabled: (v) => set({ ttsEnabled: v }),
  setReadingMode: (mode) => set({ readingMode: mode }),
  setTtsRate: (rate) => set({ ttsRate: Math.max(0.5, Math.min(2, rate)) }),
  setVideoCaptionMode: (v) => set({ videoCaptionMode: v }),
  clearCaptions: () => set({ windowText: '', interimText: '' }),
}));
