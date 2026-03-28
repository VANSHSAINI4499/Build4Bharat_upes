import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReadableSections } from '../utils/contentReader';

const READING_STYLE_PRESETS = {
    compact: { label: 'Compact', pauseMultiplier: 0.7, speechRate: 1.15 },
    natural: { label: 'Natural', pauseMultiplier: 1, speechRate: 1 },
    slow: { label: 'Slow', pauseMultiplier: 1.45, speechRate: 0.85 },
};

const VoiceAssistant = () => {
    const navigate = useNavigate();

    const recognitionRef = useRef(null);
    const shouldKeepListeningRef = useRef(false);
    const navigationTimerRef = useRef(null);
    const readDelayTimerRef = useRef(null);
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
        const text = rawText.toLowerCase().trim();
        setLastCommand(text);

        if (text.includes('read this page') || text.includes('read page')) {
            readPage();
            return;
        }

        if (text.includes('stop reading')) {
            stopReading('Stopped reading.');
            return;
        }

        if (text.includes('pause reading')) {
            if (readDelayTimerRef.current) {
                clearTimeout(readDelayTimerRef.current);
                readDelayTimerRef.current = null;
            }
            window.speechSynthesis.pause();
            readerStateRef.current.paused = true;
            setFeedback('Paused reading.');
            return;
        }

        if (text.includes('resume reading')) {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            } else if (!window.speechSynthesis.speaking) {
                readCurrentChunk();
            }
            readerStateRef.current.paused = false;
            setFeedback('Resumed reading.');
            return;
        }

        if (text.includes('reading style compact')) {
            setReadingStyle('compact');
            setFeedback('Reading style set to Compact.');
            return;
        }

        if (text.includes('reading style natural')) {
            setReadingStyle('natural');
            setFeedback('Reading style set to Natural.');
            return;
        }

        if (text.includes('reading style slow')) {
            setReadingStyle('slow');
            setFeedback('Reading style set to Slow.');
            return;
        }

        if (text.includes('next section')) {
            moveToSection(1);
            return;
        }

        if (text.includes('previous section') || text.includes('back section')) {
            moveToSection(-1);
            return;
        }

        if (text.includes('go to ai course') || text.includes('open ai course')) {
            goToRoute('/product', 'AI course');
            return;
        }

        if (text.includes('open vision assist') || text.includes('go to vision assist')) {
            goToRoute('/vision', 'Vision Assist');
            return;
        }

        if (text.includes('open captions') || text.includes('go to captions') || text.includes('open live captions')) {
            goToRoute('/captions', 'Live Captions');
            return;
        }

        if (text.includes('go to home') || text.includes('open home')) {
            goToRoute('/new', 'home dashboard');
            return;
        }

        if (text.includes('open login') || text.includes('go to login')) {
            goToRoute('/', 'login');
            return;
        }

        if (text.includes('stop listening')) {
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

        recognition.onerror = (event) => {
            setFeedback(`Voice error: ${event.error}`);
        };

        recognition.onend = () => {
            if (shouldKeepListeningRef.current) {
                recognition.start();
            }
        };

        recognitionRef.current = recognition;

        return () => {
            shouldKeepListeningRef.current = false;
            recognition.stop();
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
            recognitionRef.current.stop();
            setIsListening(false);
            setFeedback('Voice listening stopped.');
            return;
        }

        const startListening = async () => {
            try {
                if (navigator.mediaDevices?.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach((track) => track.stop());
                }

                shouldKeepListeningRef.current = true;
                recognitionRef.current.start();
                setIsListening(true);
                setFeedback('Listening... Speak a command now.');
            } catch (error) {
                const message =
                    error?.name === 'NotAllowedError'
                        ? 'Microphone permission denied. Please allow microphone access.'
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
            <div className="voice-assistant-panel" role="status">
                <p className="voice-assistant-title">Voice Assistant</p>
                <p className="voice-assistant-meta">Speech recognition is not supported in this browser.</p>
            </div>
        );
    }

    return (
        <div className="voice-assistant-panel skip-reading" data-no-read="true" aria-live="polite">
            <p className="voice-assistant-title">Voice Assistant</p>
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
                >
                    {isListening ? 'Stop Mic' : 'Start Mic'}
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
    );
};

export default VoiceAssistant;
