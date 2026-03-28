import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Braille map (reused from Subtitles.jsx logic) ────────────────────────────
const brailleMap = {
  a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑', f: '⠋', g: '⠛', h: '⠓',
  i: '⠊', j: '⠚', k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕', p: '⠏',
  q: '⠟', r: '⠗', s: '⠎', t: '⠞', u: '⠥', v: '⠧', w: '⠺', x: '⠭',
  y: '⠽', z: '⠵', ' ': ' ',
};

const toBraille = (text) =>
  text
    .toLowerCase()
    .split('')
    .map((ch) => brailleMap[ch] ?? ch)
    .join('');

// Only the most recent 30 words are kept in state at any time.
// Anything older is discarded immediately — nothing is cached.
const MAX_WORDS = 30;

// Arduino timing: 6 dots × (150+100)ms + 500ms gap ≈ 2000 ms per character
const CHAR_DELAY_MS = 2000;

// ─── Component ────────────────────────────────────────────────────────────────
const LiveCaptions = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [windowText, setWindowText] = useState(''); // Rolling 30-word string, old words dropped
  const [interimText, setInterimText] = useState(''); // Current interim transcript
  const [statusMsg, setStatusMsg] = useState('Ready');
  const [micError, setMicError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showBraille, setShowBraille] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // ── Arduino / tactile device state ────────────────────────────────────────
  const [arduinoConnected, setArduinoConnected] = useState(false);
  const [autoVibrate, setAutoVibrate] = useState(false); // auto-send captions to Arduino
  const [vibrateProgress, setVibrateProgress] = useState('');

  // ── Refs ───────────────────────────────────────────────────────────────────
  const recognitionRef = useRef(null);       // SpeechRecognition instance
  const shouldListenRef = useRef(false);     // Controls auto-restart
  const captionEndRef = useRef(null);        // Scroll anchor
  const videoRef = useRef(null);             // Camera preview element
  const cameraStreamRef = useRef(null);      // MediaStream for cleanup
  const networkRetryRef = useRef(0);         // Consecutive network-error counter
  const retryTimerRef = useRef(null);        // setTimeout handle for network retry
  const rafRef = useRef(null);              // RAF handle — throttles interim setState
  const scrollRafRef = useRef(null);        // RAF handle — throttles auto-scroll
  const portRef = useRef(null);             // Web Serial port handle
  const vibrateQueueRef = useRef([]);       // Words waiting to be vibrated
  const vibratingRef = useRef(false);       // Guard: only one send loop at a time
  const autoVibrateRef = useRef(false);     // Ref mirror of autoVibrate (for use inside closures)

  // ─────────────────────────────────────────────────────────────────────────
  // Arduino helpers — Web Serial send + word queue drain
  // ─────────────────────────────────────────────────────────────────────────

  // Send one character over the serial port
  const sendChar = async (char) => {
    if (!portRef.current) return;
    const encoder = new TextEncoder();
    const writer = portRef.current.writable.getWriter();
    try { await writer.write(encoder.encode(char)); }
    finally { writer.releaseLock(); }
  };

  // Drain the queue word-by-word, letter-by-letter.
  // Runs as a single async loop so the Arduino is never flooded.
  const drainVibrateQueue = async () => {
    if (vibratingRef.current) return; // already running
    vibratingRef.current = true;
    while (vibrateQueueRef.current.length > 0) {
      const word = vibrateQueueRef.current.shift();
      const letters = word.toUpperCase().replace(/[^A-Z]/g, '');
      for (let i = 0; i < letters.length; i++) {
        if (!portRef.current) break; // disconnected mid-send
        setVibrateProgress(`📳 ${letters[i]} (${i + 1}/${letters.length}) — "${word}"`);
        await sendChar(letters[i]);
        await new Promise((r) => setTimeout(r, CHAR_DELAY_MS));
      }
    }
    setVibrateProgress('');
    vibratingRef.current = false;
  };

  // Add text to the vibration queue and start draining
  const enqueueForVibration = (text) => {
    if (!portRef.current) return;
    vibrateQueueRef.current.push(...text.trim().split(/\s+/).filter(Boolean));
    drainVibrateQueue();
  };

  const connectArduino = async () => {
    if (!('serial' in navigator)) {
      alert('Web Serial API not supported. Use Chrome or Edge.');
      return;
    }
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;
      setArduinoConnected(true);
    } catch { /* user cancelled the port picker */ }
  };

  const disconnectArduino = async () => {
    vibrateQueueRef.current = [];
    if (portRef.current) {
      try { await portRef.current.close(); } catch { /* ignore */ }
      portRef.current = null;
    }
    setArduinoConnected(false);
    setVibrateProgress('');
    autoVibrateRef.current = false;
    setAutoVibrate(false);
  };

  // Keep ref in sync with state so the recognition closure always sees the latest value
  const toggleAutoVibrate = () => {
    setAutoVibrate((v) => { autoVibrateRef.current = !v; return !v; });
  };

  // Cleanup serial on component unmount
  useEffect(() => () => { disconnectArduino(); }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Camera setup — request video stream and bind it to the <video> element
  // ─────────────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // Camera is optional — silently ignore if user denies or no camera present
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Speech recognition setup — build the recognition instance once on mount
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;      // Keep listening without re-triggering
    recognition.interimResults = true;  // Surface partial results in real time
    recognition.lang = 'en-US';

    // ── onresult: fires every time audio is available ──────────────────────
    recognition.onresult = (event) => {
      let interim = '';

      // Walk only the new results from the last processed index
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          // Finalised phrase — append a permanent caption entry
          const finalText = transcript.trim();
          if (!finalText) continue;

          // Optional: speak the finalised text back via TTS
          if (ttsEnabled && window.speechSynthesis) {
            const utt = new SpeechSynthesisUtterance(finalText);
            utt.rate = 1;
            window.speechSynthesis.speak(utt);
          }

          // Merge new words into the rolling window.
          // Split both old and new text into words, keep only the last MAX_WORDS.
          // Old words are dropped immediately — nothing accumulates in memory.
          setWindowText((prev) => {
            const words = [
              ...prev.split(/\s+/).filter(Boolean),
              ...finalText.split(/\s+/).filter(Boolean),
            ];
            return words.slice(-MAX_WORDS).join(' ');
          });
          setInterimText('');

          // Auto-vibrate: send each finalised phrase to the Arduino as it arrives
          if (autoVibrateRef.current && portRef.current) {
            enqueueForVibration(finalText);
          }
        } else {
          // Interim phrase — accumulated and shown live below the caption list
          interim += transcript;
        }
      }

      // Throttle interim setState through requestAnimationFrame.
      // Recognition fires events 10-20x per second; without this every event
      // triggers a full React re-render, causing the lag after ~50 words.
      if (interim) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setInterimText(interim);
          rafRef.current = null;
        });
      }
    };

    recognition.onerror = (event) => {
      // "no-speech" is expected during silence — ignore it
      if (event.error === 'no-speech') return;

      // "network" is often a transient hiccup from Chrome's speech service.
      // Auto-retry up to 5 times (with a 1 s delay) before showing an error.
      if (event.error === 'network') {
        networkRetryRef.current += 1;
        if (shouldListenRef.current && networkRetryRef.current <= 5) {
          setStatusMsg(`Reconnecting… (attempt ${networkRetryRef.current})`);
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
          retryTimerRef.current = setTimeout(() => {
            if (shouldListenRef.current) {
              try { recognition.start(); } catch { /* already starting */ }
            }
          }, 1000);
          return; // don't surface the error banner yet
        }
        // More than 5 failures — show the banner but keep retrying
        setMicError('Speech service is having trouble reaching Google\'s servers. Check your internet connection.');
        setStatusMsg('Reconnecting…');
        return;
      }

      // Reset network counter for non-network errors
      networkRetryRef.current = 0;

      const messages = {
        'not-allowed': 'Microphone access denied. Please allow mic permissions.',
        'audio-capture': 'No microphone found. Connect a mic and try again.',
      };
      setMicError(messages[event.error] ?? `Speech error: ${event.error}`);
      setStatusMsg('Error');
    };

    // ── onend: auto-restart if the user wants continuous listening ─────────
    recognition.onend = () => {
      if (shouldListenRef.current) {
        // Only restart here if there is no pending retry timer (network errors
        // schedule their own delayed restart above).
        if (!retryTimerRef.current) {
          try {
            recognition.start();
          } catch {
            // May throw if already starting; ignore
          }
        }
      } else {
        setIsListening(false);
        setStatusMsg('Stopped');
        setInterimText('');
      }
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      shouldListenRef.current = false;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      recognition.stop();
    };
  }, []); // ttsEnabled intentionally excluded — toggling TTS doesn't need a new instance

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-scroll — throttled via RAF so rapid interim updates don't cause
  // scrollIntoView to fire more than once per animation frame.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoScroll || !captionEndRef.current) return;
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      captionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      scrollRafRef.current = null;
    });
  }, [windowText, interimText, autoScroll]);

  // Cancel pending scroll RAF on unmount
  useEffect(() => () => {
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Cleanup camera and mic on unmount
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // ─────────────────────────────────────────────────────────────────────────
  // Controls
  // ─────────────────────────────────────────────────────────────────────────
  const startListening = async () => {
    if (!recognitionRef.current) return;
    setMicError('');
    networkRetryRef.current = 0;  // reset retry counter on fresh start
    if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }

    // Explicitly request mic permission before starting recognition
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop()); // We only needed the permission check
    } catch (err) {
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow mic permissions in your browser.'
          : 'Could not access microphone. Check device settings.';
      setMicError(msg);
      return;
    }

    shouldListenRef.current = true;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setStatusMsg('Listening...');
    } catch {
      // Already started; ignore
    }
  };

  const stopListening = () => {
    shouldListenRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatusMsg('Stopped');
    setInterimText('');
  };

  const clearCaptions = () => {
    setWindowText('');
    setInterimText('');
  };

  // windowText is already the exact string we need — no mapping or joining required.
  const allCaptionText = windowText;

  // ─────────────────────────────────────────────────────────────────────────
  // Unsupported browser fallback
  // ─────────────────────────────────────────────────────────────────────────
  if (!isSupported) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-red-500 rounded-2xl p-8 max-w-lg text-center">
          <p className="text-red-400 text-2xl font-bold mb-3">Browser Not Supported</p>
          <p className="text-gray-300 text-lg">
            Live Captions requires the Web Speech API. Please use Google Chrome or Microsoft Edge.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white text-sm font-medium transition"
        >
          ← Back
        </button>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-wide text-green-400">
          🎙 Live Captions{' '}
          <span className="text-gray-500 font-normal text-base">(Speech to Text)</span>
        </h1>
        {/* Status badge */}
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isListening
              ? 'bg-green-600 text-white animate-pulse'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          {statusMsg}
        </span>
      </header>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex flex-col md:flex-row flex-1 gap-4 p-4 md:p-6">

        {/* ── Left column: camera + controls ──────────────────────────── */}
        <aside className="flex flex-col gap-4 md:w-72 shrink-0">

          {/* Camera preview */}
          <div className="rounded-2xl overflow-hidden border border-gray-700 bg-gray-900">
            <p className="text-xs text-gray-500 text-center py-1 tracking-widest uppercase">
              Camera Preview
            </p>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full aspect-video object-cover"
            />
          </div>

          {/* Control buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={startListening}
              disabled={isListening}
              className={`w-full py-3 rounded-xl font-bold text-lg transition ${
                isListening
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
            >
              ▶ Start Listening
            </button>
            <button
              onClick={stopListening}
              disabled={!isListening}
              className={`w-full py-3 rounded-xl font-bold text-lg transition ${
                !isListening
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              ■ Stop Listening
            </button>
            <button
              onClick={clearCaptions}
              className="w-full py-3 rounded-xl font-bold text-lg bg-gray-700 hover:bg-gray-600 text-white transition"
            >
              ✕ Clear Captions
            </button>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-2 bg-gray-900 rounded-xl p-4 border border-gray-700">
            <ToggleRow
              label="Auto Scroll"
              checked={autoScroll}
              onChange={() => setAutoScroll((v) => !v)}
            />
            <ToggleRow
              label="Show Braille"
              checked={showBraille}
              onChange={() => setShowBraille((v) => !v)}
            />
            <ToggleRow
              label="Text-to-Speech (TTS)"
              checked={ttsEnabled}
              onChange={() => setTtsEnabled((v) => !v)}
            />
          </div>

          {/* ── Arduino tactile device panel ──────────────────────────── */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 flex flex-col gap-3">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Tactile Device</p>

            {!arduinoConnected ? (
              <button
                onClick={connectArduino}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition"
              >
                🔌 Connect Arduino
              </button>
            ) : (
              <>
                <p className="text-green-400 text-xs font-semibold">🟢 Arduino Connected</p>

                {/* Auto-send every caption to the Arduino as it finalises */}
                <ToggleRow
                  label="Auto Vibrate (live)"
                  checked={autoVibrate}
                  onChange={toggleAutoVibrate}
                />

                {/* Manual one-shot send */}
                <button
                  onClick={() => { if (windowText) enqueueForVibration(windowText); }}
                  disabled={!windowText}
                  className="w-full py-2 rounded-lg bg-[#20B486] hover:bg-green-600 text-white font-bold text-sm transition disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  📳 Send Captions Now
                </button>

                {/* Live vibration progress */}
                {vibrateProgress && (
                  <p className="text-blue-400 text-xs font-medium animate-pulse">{vibrateProgress}</p>
                )}

                <button
                  onClick={disconnectArduino}
                  className="w-full py-1 rounded-lg bg-red-900 hover:bg-red-800 text-red-300 text-xs transition"
                >
                  Disconnect
                </button>
              </>
            )}
          </div>

          {/* Mic error */}
          {micError && (
            <div
              role="alert"
              className="bg-red-900 border border-red-600 rounded-xl p-3 text-red-300 text-sm"
            >
              ⚠ {micError}
            </div>
          )}
        </aside>

        {/* ── Right column: caption display ───────────────────────────── */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Caption box */}
          <div
            className="flex-1 bg-gray-950 border border-gray-700 rounded-2xl p-5 overflow-y-auto"
            style={{ minHeight: '320px', maxHeight: '55vh' }}
            aria-live="off"
            aria-label="Live caption output"
          >
            {!windowText && !interimText ? (
              <p className="text-gray-600 text-xl text-center mt-10 select-none">
                Captions will appear here once you start listening…
              </p>
            ) : (
              <>
                {/* Rolling 30-word window — single element, no list */}
                {windowText && (
                  <p className="text-white text-2xl md:text-3xl font-semibold leading-relaxed mb-2">
                    {windowText}
                  </p>
                )}

                {/* Live interim text */}
                {interimText && (
                  <p className="text-green-400 text-2xl md:text-3xl font-semibold leading-relaxed mb-2 italic opacity-80">
                    {interimText}
                  </p>
                )}

                {/* Scroll anchor */}
                <div ref={captionEndRef} />
              </>
            )}
          </div>

          {/* Braille panel — toggled */}
          {showBraille && allCaptionText && (
            <div className="bg-gray-900 border border-yellow-600 rounded-2xl p-4">
              <p className="text-yellow-400 text-xs uppercase tracking-widest mb-2">
                Braille Output
              </p>
              <p className="font-mono text-2xl text-yellow-300 leading-loose break-words">
                {toBraille(allCaptionText)}
              </p>
            </div>
          )}

          {/* Caption stats */}
          <div className="flex gap-4 text-sm text-gray-500">
            <span>{allCaptionText.split(/\s+/).filter(Boolean).length} / {MAX_WORDS} words</span>
          </div>
        </section>
      </main>

      {/* ── Accessibility info footer ────────────────────────────────────── */}
      <footer className="text-center text-gray-700 text-xs py-3 border-t border-gray-900 px-4">
        Designed for deaf users · Sparshgyan Accessibility Suite · Web Speech API powered
      </footer>
    </div>
  );
};

// ─── Small helper: labelled toggle switch ─────────────────────────────────────
const ToggleRow = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer select-none">
    <span className="text-gray-300 text-sm">{label}</span>
    <div className="relative">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={`w-10 h-5 rounded-full transition ${
          checked ? 'bg-green-600' : 'bg-gray-600'
        }`}
      />
      <div
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
  </label>
);

export default LiveCaptions;
