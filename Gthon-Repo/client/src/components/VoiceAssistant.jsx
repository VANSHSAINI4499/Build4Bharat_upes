import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReadableSections } from '../utils/contentReader';

const READING_STYLE_PRESETS = {
    compact: { label: 'Compact', pauseMultiplier: 0.7, speechRate: 1.15 },
    natural: { label: 'Natural', pauseMultiplier: 1, speechRate: 1 },
    slow: { label: 'Slow', pauseMultiplier: 1.45, speechRate: 0.85 },
};

const matchesAny = (text, patterns) => {
    return patterns.some((pattern) => pattern.test(text));
};

const normalizeCommand = (input) => {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

const VoiceAssistant = () => {
    const navigate = useNavigate();

    const recognitionRef = useRef(null);
    const shouldKeepListeningRef = useRef(false);
    const navigationTimerRef = useRef(null);
    const readDelayTimerRef = useRef(null);
    const recognitionRestartTimerRef = useRef(null);
    const recognitionRetryCountRef = useRef(0);
    const recognitionStartingRef = useRef(false);
    const lastProcessedCommandRef = useRef({ text: '', at: 0 });
    const readerStateRef = useRef({
        sections: [],
        sectionIndex: 0,
        chunkIndex: 0,
        paused: false,
    });

    const [isSupported, setIsSupported] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastCommand, setLastCommand] = useState('');
    const [feedback, setFeedback] = useState('Idle');
    const [manualCommand, setManualCommand] = useState('');
    const [currentSectionLabel, setCurrentSectionLabel] = useState('');
    const [readingStyle, setReadingStyle] = useState('natural');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMicStarting, setIsMicStarting] = useState(false);

    const commandHints = useMemo(
        () => [
            'Read this page',
            'Stop reading',
            'Pause reading',
            'Next section',
            'Go to AI course',
            'Open vision assist',
            'Open captions',
        ],
        [],
    );

    const stopReading = (message = 'Stopped reading.') => {
        window.speechSynthesis.cancel();
        if (readDelayTimerRef.current) {
            clearTimeout(readDelayTimerRef.current);
            readDelayTimerRef.current = null;
        }
        readerStateRef.current.paused = false;
        setIsSpeaking(false);
        setCurrentSectionLabel('');
        setFeedback(message);
    };

    const resetRecognitionRetryState = () => {
        recognitionRetryCountRef.current = 0;
        if (recognitionRestartTimerRef.current) {
            clearTimeout(recognitionRestartTimerRef.current);
            recognitionRestartTimerRef.current = null;
        }
    };

    const scheduleRecognitionRestart = (reason = 'Trying to reconnect microphone...') => {
        if (!shouldKeepListeningRef.current || !recognitionRef.current) {
            return;
        }

        if (recognitionRestartTimerRef.current) {
            return;
        }

        const retryDelay = Math.min(1800, 250 * (recognitionRetryCountRef.current + 1));

        recognitionRestartTimerRef.current = setTimeout(() => {
            recognitionRestartTimerRef.current = null;
            if (!shouldKeepListeningRef.current || !recognitionRef.current) {
                return;
            }

            try {
                recognitionStartingRef.current = true;
                recognitionRef.current.start();
                setFeedback(reason);
            } catch {
                recognitionStartingRef.current = false;
                recognitionRetryCountRef.current += 1;
                scheduleRecognitionRestart('Reconnecting microphone...');
            }
        }, retryDelay);
    };

    const speakAssistant = (message, onEnd) => {
        if (!window.speechSynthesis) {
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onend = () => {
            if (onEnd) {
                onEnd();
            }
        };
        window.speechSynthesis.speak(utterance);
    };

    const readCurrentChunk = () => {
        const { sections, sectionIndex, chunkIndex, paused } = readerStateRef.current;

        if (paused || !sections.length) {
            return;
        }

        const section = sections[sectionIndex];
        const chunk = section?.chunks?.[chunkIndex];
        const chunkText = typeof chunk === 'string' ? chunk : chunk?.text;
        const styleConfig = READING_STYLE_PRESETS[readingStyle] || READING_STYLE_PRESETS.natural;
        const basePauseMs = typeof chunk === 'string' ? 650 : chunk?.pauseAfterMs || 650;
        const pauseAfterMs = Math.round(
            basePauseMs * styleConfig.pauseMultiplier,
        );

        if (!section || !chunkText) {
            setIsSpeaking(false);
            setCurrentSectionLabel('');
            setFeedback('Finished reading all sections.');
            return;
        }

        setIsSpeaking(true);
        setCurrentSectionLabel(`${section.heading} (${sectionIndex + 1}/${sections.length})`);
        setFeedback(`Reading: ${section.heading}`);

        const utterance = new SpeechSynthesisUtterance(chunkText);
        utterance.rate = styleConfig.speechRate;
        utterance.pitch = 1;
        utterance.onend = () => {
            const state = readerStateRef.current;
            const activeSection = state.sections[state.sectionIndex];

            if (!activeSection) {
                setIsSpeaking(false);
                setCurrentSectionLabel('');
                return;
            }

            if (state.chunkIndex < activeSection.chunks.length - 1) {
                state.chunkIndex += 1;
            } else {
                state.sectionIndex += 1;
                state.chunkIndex = 0;
            }

            readDelayTimerRef.current = setTimeout(() => {
                if (readerStateRef.current.paused) {
                    return;
                }

                if (state.sectionIndex >= state.sections.length) {
                    setIsSpeaking(false);
                    setCurrentSectionLabel('');
                    setFeedback('Finished reading all sections.');
                    return;
                }

                readCurrentChunk();
            }, pauseAfterMs);
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setCurrentSectionLabel('');
            setFeedback('Text-to-speech could not start on this browser.');
        };

        window.speechSynthesis.speak(utterance);
    };

    const readPage = () => {
        const sections = getReadableSections();

        if (!sections.length) {
            setFeedback('No readable main content found on this page.');
            return;
        }

        readerStateRef.current = {
            sections,
            sectionIndex: 0,
            chunkIndex: 0,
            paused: false,
        };

        speakAssistant('Okay, reading the main content now.', () => {
            readCurrentChunk();
        });
    };

    const moveToSection = (step) => {
        const state = readerStateRef.current;

        if (!state.sections.length) {
            setFeedback('Nothing is being read right now.');
            return;
        }

        const nextSectionIndex = Math.min(
            state.sections.length - 1,
            Math.max(0, state.sectionIndex + step),
        );

        state.sectionIndex = nextSectionIndex;
        state.chunkIndex = 0;
        state.paused = false;

        if (readDelayTimerRef.current) {
            clearTimeout(readDelayTimerRef.current);
            readDelayTimerRef.current = null;
        }
        window.speechSynthesis.cancel();
        readCurrentChunk();
    };

    const goToRoute = (path, pageName) => {
        const spokenReply = `Okay, taking you to the ${pageName} page.`;
        speakAssistant(spokenReply);
        setFeedback(spokenReply);

        if (window.location.pathname !== path) {
            if (navigationTimerRef.current) {
                clearTimeout(navigationTimerRef.current);
            }

            navigationTimerRef.current = setTimeout(() => {
                navigate(path);
            }, 350);
        }
    };

    const handleCommand = (rawText) => {
        const text = normalizeCommand(rawText);

        const now = Date.now();
        const isDuplicate =
            lastProcessedCommandRef.current.text === text
            && now - lastProcessedCommandRef.current.at < 1400;

        if (isDuplicate) {
            return;
        }

        lastProcessedCommandRef.current = { text, at: now };
        setLastCommand(text);

        if (matchesAny(text, [/\bread( this)? page\b/, /\bread out\b/, /\bstart reading\b/])) {
            readPage();
            return;
        }

        if (matchesAny(text, [/\bstop reading\b/, /\bstop read\b/, /\bend reading\b/])) {
            stopReading('Stopped reading.');
            return;
        }

        if (matchesAny(text, [/\bpause reading\b/, /\bhold reading\b/, /\bwait reading\b/])) {
            if (readDelayTimerRef.current) {
                clearTimeout(readDelayTimerRef.current);
                readDelayTimerRef.current = null;
            }
            window.speechSynthesis.pause();
            readerStateRef.current.paused = true;
            setFeedback('Paused reading.');
            return;
        }

        if (matchesAny(text, [/\bresume reading\b/, /\bcontinue reading\b/, /\bstart reading again\b/])) {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            } else if (!window.speechSynthesis.speaking) {
                readCurrentChunk();
            }
            readerStateRef.current.paused = false;
            setFeedback('Resumed reading.');
            return;
        }

        if (matchesAny(text, [/\breading style compact\b/, /\bcompact mode\b/, /\bfast mode\b/])) {
            setReadingStyle('compact');
            setFeedback('Reading style set to Compact.');
            return;
        }

        if (matchesAny(text, [/\breading style natural\b/, /\bnatural mode\b/, /\bnormal mode\b/])) {
            setReadingStyle('natural');
            setFeedback('Reading style set to Natural.');
            return;
        }

        if (matchesAny(text, [/\breading style slow\b/, /\bslow mode\b/, /\bslow reading\b/])) {
            setReadingStyle('slow');
            setFeedback('Reading style set to Slow.');
            return;
        }

        if (matchesAny(text, [/\bnext section\b/, /\bskip section\b/, /\bgo to next\b/])) {
            moveToSection(1);
            return;
        }

        if (matchesAny(text, [/\bprevious section\b/, /\bback section\b/, /\bgo to previous\b/])) {
            moveToSection(-1);
            return;
        }

        if (matchesAny(text, [/\bgo to ai course\b/, /\bopen ai course\b/, /\btake me to ai course\b/, /\bshow ai course\b/])) {
            goToRoute('/product', 'AI course');
            return;
        }

        if (matchesAny(text, [/\bopen vision assist\b/, /\bgo to vision assist\b/, /\bvision mode\b/, /\bopen vision\b/])) {
            goToRoute('/vision', 'Vision Assist');
            return;
        }

        if (matchesAny(text, [/\bopen captions\b/, /\bgo to captions\b/, /\bopen live captions\b/, /\bshow captions\b/])) {
            goToRoute('/captions', 'Live Captions');
            return;
        }

        if (matchesAny(text, [
            /\bgo to home\b/,
            /\bopen home\b/,
            /\bgo to homepage\b/,
            /\bgo back to home\b/,
            /\bgo back to homepage\b/,
            /\btake me home\b/,
            /\bopen home page\b/,
            /\breturn home\b/,
        ])) {
            goToRoute('/new', 'home dashboard');
            return;
        }

        if (matchesAny(text, [/\bopen login\b/, /\bgo to login\b/, /\blogin page\b/, /\bgo to sign in\b/])) {
            goToRoute('/', 'login');
            return;
        }

        if (matchesAny(text, [/\bstop listening\b/, /\bstop mic\b/, /\bturn off mic\b/, /\bdisable listening\b/])) {
            shouldKeepListeningRef.current = false;
            setIsListening(false);
            speakAssistant('Okay, stopping voice listening.');
            setFeedback('Voice listening stopped.');
            return;
        }

        speakAssistant('Sorry, I did not understand that command.');
        setFeedback('Command not recognized. Try one of the listed commands.');
    };

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            return undefined;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript =
                event.results[event.results.length - 1][0].transcript?.trim() || '';

            if (!transcript) {
                return;
            }

            setFeedback(`Command detected: ${transcript}`);
            handleCommand(transcript);
        };

        recognition.onstart = () => {
            recognitionStartingRef.current = false;
            resetRecognitionRetryState();
            setIsListening(true);
            setIsMicStarting(false);
            setFeedback('Listening... Speak a command now.');
        };

        recognition.onerror = (event) => {
            recognitionStartingRef.current = false;
            setIsMicStarting(false);

            // Keep the logical listening intent alive and attempt self-heal for transient errors.
            if (shouldKeepListeningRef.current && (event.error === 'network' || event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'aborted')) {
                setIsListening(true);
                scheduleRecognitionRestart('Reconnecting microphone...');
            } else {
                setIsListening(false);
            }

            if (event.error === 'not-allowed') {
                shouldKeepListeningRef.current = false;
                setFeedback('Microphone permission denied. Please allow mic access in browser settings.');
                return;
            }

            if (event.error === 'network') {
                setFeedback('Speech recognition network error. Check internet and try again.');
                return;
            }

            if (event.error === 'no-speech') {
                setFeedback('No speech detected. Try speaking a little louder.');
                return;
            }

            setFeedback(`Voice error: ${event.error}`);
        };

        recognition.onend = () => {
            if (shouldKeepListeningRef.current) {
                if (!recognitionStartingRef.current) {
                    scheduleRecognitionRestart('Reconnecting microphone...');
                }
                return;
            }

            setIsListening(false);
            setIsMicStarting(false);
        };

        recognitionRef.current = recognition;

        return () => {
            shouldKeepListeningRef.current = false;
            recognitionStartingRef.current = false;
            recognition.stop();
            resetRecognitionRetryState();
            if (navigationTimerRef.current) {
                clearTimeout(navigationTimerRef.current);
            }
            if (readDelayTimerRef.current) {
                clearTimeout(readDelayTimerRef.current);
                readDelayTimerRef.current = null;
            }
            stopReading('Voice assistant reset.');
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current || !isSupported) {
            return;
        }

        if (isListening) {
            shouldKeepListeningRef.current = false;
            recognitionStartingRef.current = false;
            recognitionRef.current.stop();
            resetRecognitionRetryState();
            setIsListening(false);
            setIsMicStarting(false);
            setFeedback('Voice listening stopped.');
            return;
        }

        const startListening = async () => {
            try {
                if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                    setFeedback('Microphone access requires HTTPS (or localhost).');
                    return;
                }

                setIsMicStarting(true);
                setFeedback('Requesting microphone permission...');

                let preflightWarning = '';

                if (navigator.mediaDevices?.getUserMedia) {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        stream.getTracks().forEach((track) => track.stop());
                    } catch (probeError) {
                        if (probeError?.name === 'NotAllowedError') {
                            setIsMicStarting(false);
                            setIsListening(false);
                            setFeedback('Microphone permission denied. Please allow microphone access.');
                            return;
                        }

                        // Do not fail here: some environments return false negatives on preflight.
                        preflightWarning = 'Microphone pre-check failed, trying direct voice start...';
                    }
                }

                shouldKeepListeningRef.current = true;
                try {
                    recognitionStartingRef.current = true;
                    recognitionRef.current.start();
                    if (preflightWarning) {
                        setFeedback(preflightWarning);
                    }
                } catch (startError) {
                    recognitionStartingRef.current = false;
                    setIsMicStarting(false);
                    setIsListening(false);
                    const startMessage =
                        startError?.name === 'NotAllowedError'
                            ? 'Microphone permission denied. Please allow microphone access.'
                            : 'Could not start voice recognition. Please check browser microphone permissions.';
                    setFeedback(startMessage);
                }
            } catch (error) {
                setIsMicStarting(false);
                setIsListening(false);
                const message =
                    error?.name === 'NotAllowedError'
                        ? 'Microphone permission denied. Please allow microphone access.'
                        : error?.name === 'NotFoundError'
                            ? 'Microphone not available to this browser session. Check site permissions and selected input device.'
                        : 'Could not access microphone. Check browser permissions.';
                setFeedback(message);
            }
        };

        startListening();
    };

    const runManualCommand = (event) => {
        event.preventDefault();
        const input = manualCommand.trim();
        if (!input) {
            return;
        }

        handleCommand(input);
        setManualCommand('');
    };

    if (!isSupported) {
        return (
            <div className="voice-assistant-shell skip-reading" data-no-read="true">
                <button type="button" className="voice-assistant-pill" onClick={() => setIsExpanded((prev) => !prev)} aria-expanded={isExpanded}>
                    Voice Assistant
                </button>
                {isExpanded ? (
                    <div className="voice-assistant-panel" role="status">
                        <div className="voice-assistant-header">
                            <p className="voice-assistant-title">Voice Assistant</p>
                            <button type="button" className="voice-assistant-minimize" onClick={() => setIsExpanded(false)} aria-label="Collapse voice assistant">
                                Minimize
                            </button>
                        </div>
                        <p className="voice-assistant-meta">Speech recognition is not supported in this browser.</p>
                    </div>
                ) : null}
            </div>
        );
    }

    return (
        <div className="voice-assistant-shell skip-reading" data-no-read="true" aria-live="polite">
            {!isExpanded ? (
                <button
                    type="button"
                    className="voice-assistant-pill"
                    onClick={() => setIsExpanded(true)}
                    aria-expanded={isExpanded}
                    aria-label="Open voice assistant"
                >
                    🎤 Voice Assistant
                    {(isListening || isSpeaking) ? <span className="voice-assistant-pill-dot" aria-hidden="true" /> : null}
                </button>
            ) : null}

            {isExpanded ? (
            <div className="voice-assistant-panel">
            <div className="voice-assistant-header">
            <p className="voice-assistant-title">Voice Assistant</p>
            <button type="button" className="voice-assistant-minimize" onClick={() => setIsExpanded(false)} aria-label="Collapse voice assistant">
                Minimize
            </button>
            </div>
            <p className="voice-assistant-meta" aria-live="polite" aria-atomic="true">
                {isListening ? 'Listening...' : 'Tap mic to start'}
            </p>
            <p className="voice-assistant-feedback" role="status" aria-live="assertive" aria-atomic="true">
                {feedback}
            </p>
            <p className="voice-assistant-meta">Reading style: {READING_STYLE_PRESETS[readingStyle].label}</p>
            {currentSectionLabel ? <p className="voice-assistant-command">Reading: {currentSectionLabel}</p> : null}
            {lastCommand ? <p className="voice-assistant-command">Last: {lastCommand}</p> : null}

            <div className="voice-assistant-style-row" role="group" aria-label="Reading style">
                {Object.entries(READING_STYLE_PRESETS).map(([styleKey, config]) => (
                    <button
                        key={styleKey}
                        type="button"
                        className={`voice-assistant-style ${readingStyle === styleKey ? 'active' : ''}`}
                        onClick={() => {
                            setReadingStyle(styleKey);
                            setFeedback(`Reading style set to ${config.label}.`);
                        }}
                        aria-pressed={readingStyle === styleKey}
                    >
                        {config.label}
                    </button>
                ))}
            </div>

            <div className="voice-assistant-actions">
                <button
                    type="button"
                    className={`voice-assistant-button voice-assistant-mic ${isListening ? 'active' : ''}`}
                    onClick={toggleListening}
                    disabled={isMicStarting}
                >
                    {isMicStarting ? 'Starting Mic...' : isListening ? 'Stop Mic' : 'Start Mic'}
                </button>
                <button
                    type="button"
                    className={`voice-assistant-button secondary ${isSpeaking ? 'active' : ''}`}
                    onClick={() => {
                        if (isSpeaking) {
                            stopReading('Stopped reading.');
                            return;
                        }

                        readPage();
                    }}
                >
                    {isSpeaking ? 'Stop Reading' : 'Read Page'}
                </button>
            </div>

            {isSpeaking ? (
                <div className="voice-assistant-actions">
                    <button type="button" className="voice-assistant-button" onClick={() => moveToSection(-1)}>
                        Previous
                    </button>
                    <button type="button" className="voice-assistant-button" onClick={() => moveToSection(1)}>
                        Next
                    </button>
                </div>
            ) : null}

            <form className="voice-assistant-input-row" onSubmit={runManualCommand}>
                <input
                    type="text"
                    value={manualCommand}
                    onChange={(event) => setManualCommand(event.target.value)}
                    className="voice-assistant-input"
                    placeholder="Type a command if mic is unavailable"
                />
                <button type="submit" className="voice-assistant-run">
                    Run
                </button>
            </form>

            <p className="voice-assistant-hint">Try:</p>
            <ul className="voice-assistant-list">
                {commandHints.map((item) => (
                    <li key={item}>{item}</li>
                ))}
                <li>Reading style Slow</li>
            </ul>
            </div>
            ) : null}
        </div>
    );
};

export default VoiceAssistant;
