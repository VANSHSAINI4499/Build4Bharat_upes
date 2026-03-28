import React, { useState, useRef } from 'react';

// Time per character on Arduino: 6 dots × (150+100)ms + 500ms gap = 2000ms
const CHAR_DELAY_MS = 2000;

const AccessibilityControls = () => {
  const [gestureActive, setGestureActive] = useState(false);
  const [arduinoConnected, setArduinoConnected] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState('');
  const portRef = useRef(null);

  // Python Gesture Toggle
  const toggleGestureControl = () => {
    setGestureActive((prev) => !prev);
  };

  // Arduino Web Serial Connect
  const connectArduino = async () => {
    try {
      if (!('serial' in navigator)) {
        alert("Web Serial API not supported. Use Chrome or Edge.");
        return;
      }
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;
      setArduinoConnected(true);
    } catch (error) {
      console.error("Error connecting to Arduino:", error);
    }
  };

  const disconnectArduino = async () => {
    if (portRef.current) {
      await portRef.current.close();
      portRef.current = null;
      setArduinoConnected(false);
      setProgress('');
      setWordInput('');
    }
  };

  // Send a single character over serial
  const sendChar = async (char) => {
    if (!portRef.current) return;
    const encoder = new TextEncoder();
    const writer = portRef.current.writable.getWriter();
    try {
      await writer.write(encoder.encode(char));
    } finally {
      writer.releaseLock();
    }
  };

  // Send word/sentence letter-by-letter with timing gaps matching Arduino vibration duration
  const sendWordToArduino = async () => {
    if (!wordInput.trim() || sending) return;
    const letters = wordInput.toUpperCase().replace(/[^A-Z]/g, ''); // only A-Z
    if (!letters) {
      alert("Please enter letters A-Z only.");
      return;
    }

    setSending(true);
    for (let i = 0; i < letters.length; i++) {
      const char = letters[i];
      setProgress(`Sending: ${char} (${i + 1}/${letters.length})`);
      await sendChar(char);
      // Wait for Arduino to finish vibrating this character before sending next
      await new Promise(resolve => setTimeout(resolve, CHAR_DELAY_MS));
    }
    setProgress('✅ Done!');
    setSending(false);
    setTimeout(() => setProgress(''), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">

      {/* Arduino Hardware Integration */}
      {arduinoConnected ? (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64">
          <p className="text-sm font-bold text-green-600 mb-2">🟢 Tactile Device Connected</p>
          <input
            type="text"
            placeholder="Type a word (e.g. HELLO)"
            value={wordInput}
            disabled={sending}
            className="border border-gray-300 rounded px-2 text-black py-1 w-full mb-2"
            onChange={(e) => setWordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendWordToArduino()}
          />
          {progress && (
            <p className="text-xs text-blue-600 mb-2 font-medium">{progress}</p>
          )}
          <button
            onClick={sendWordToArduino}
            disabled={sending}
            className={`w-full py-1 rounded text-sm font-bold mb-2 ${sending ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#20B486] text-white hover:bg-green-700'
              }`}
          >
            {sending ? 'Vibrating...' : '📳 Send to Device'}
          </button>
          <button
            onClick={disconnectArduino}
            className="w-full bg-red-100 text-red-600 text-sm py-1 rounded hover:bg-red-200"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectArduino}
          className="px-4 py-3 rounded-full shadow-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all"
        >
          🔌 Connect Tactile Device
        </button>
      )}

      {/* Gesture Control Toggle */}
      <button
        onClick={toggleGestureControl}
        className={`px-4 py-3 rounded-full shadow-lg font-bold transition-all ${gestureActive ? 'bg-red-500 text-white' : 'bg-[#20B486] text-white hover:bg-green-700'
          }`}
      >
        {gestureActive ? '🛑 Stop Hand Gestures' : '🖐️ Enable Hand Gestures'}
      </button>
    </div>
  );
};

export default AccessibilityControls;
