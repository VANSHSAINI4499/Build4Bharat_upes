import React, { useEffect, useState } from 'react';

const brailleMap = {
  a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑',
  f: '⠋', g: '⠛', h: '⠓', i: '⠊', j: '⠚',
  k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕',
  p: '⠏', q: '⠟', r: '⠗', s: '⠎', t: '⠞',
  u: '⠥', v: '⠧', w: '⠺', x: '⠭', y: '⠽',
  z: '⠵', ' ': ' ',
  0: '⠴', 1: '⠂', 2: '⠆', 3: '⠒', 4: '⠲',
  5: '⠢', 6: '⠖', 7: '⠶', 8: '⠦', 9: '⠔',
  '.': '⠲', ',': '⠂', '!': '⠖', '?': '⠦',
  '-': '⠤', ':': '⠱', ';': '⠰', "'": '⠄',
};

const Subtitles = () => {
  const sampleText = 'Twin Alumina connects hearts and minds.';
  const [brailleText, setBrailleText] = useState('');
  
  // Extra layer of mapping protection
  const brailleConverted = window.brailleConvertedCache || sampleText
    .toLowerCase()
    .split('')
    .map(char => {
      // Find the character, default to a space if missing, and ensure it is mathematically impossible to be the 'undefined' string
      const matched = brailleMap[char];
      return typeof matched === 'string' ? matched : ' ';
    })
    .filter(char => typeof char === 'string' && char.trim() !== 'undefined');
    
  // Cache to survive StrictMode rerenders
  window.brailleConvertedCache = brailleConverted;

  useEffect(() => {
    let i = 0;
    // Force a complete wipe of the string on mount
    setBrailleText('');
    
    const interval = setInterval(() => {
      setBrailleText(prev => {
        // Double check bounds right here before updating state
        if (i < brailleConverted.length && brailleConverted[i]) {
          const newChar = brailleConverted[i];
          i++;
          return prev + newChar;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 80);
    
    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      setBrailleText(''); // Clear on exit
    };
  }, []);

  return (
    <div className="subtitle-container">
      <p className="braille-text">{brailleText}</p>
      <style jsx>{`
        .subtitle-container {
          font-family: 'Courier New', monospace;
          font-size: 1.5rem;
          padding: 1rem;
          background: #f4f4f4;
          border-radius: 8px;
          max-width: 600px;
          margin: 2rem auto;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .braille-text {
          white-space: pre-wrap;
          word-break: break-word;
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Subtitles;