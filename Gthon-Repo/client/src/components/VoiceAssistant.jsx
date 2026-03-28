import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceAssistant = () => {
    const navigate = useNavigate();

    const recognitionRef = useRef(null);
    const shouldKeepListeningRef = useRef(false);
    const navigationTimerRef = useRef(null);

    const [isSupported, setIsSupported] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lastCommand, setLastCommand] = useState('');
    const [feedback, setFeedback] = useState('Idle');
    const [manualCommand, setManualCommand] = useState('');

    const commandHints = useMemo(
        () => [
            'Read this page',
            'Stop reading',
            'Go to AI course',
            'Open vision assist',
            'Open captions',
        ],
        [],
    );

    const stopReading = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    const readPage = () => {
        const bodyText = (document.body?.innerText || '').replace(/\s+/g, ' ').trim();

        if (!bodyText) {
            setFeedback('No readable text found on this page.');
            return;
        }

        stopReading();

        const utterance = new SpeechSynthesisUtterance(bodyText.slice(0, 2500));
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onend = () => {
            setIsSpeaking(false);
            setFeedback('Finished reading.');
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setFeedback('Text-to-speech could not start on this browser.');
        };

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setFeedback('Reading this page...');
    };

    const speakAssistant = (message) => {
        if (!window.speechSynthesis) {
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
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
            stopReading();
            setFeedback('Stopped reading.');
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
            stopReading();
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
        <div className="voice-assistant-panel" aria-live="polite">
            <p className="voice-assistant-title">Voice Assistant</p>
            <p className="voice-assistant-meta">{isListening ? 'Listening...' : 'Tap mic to start'}</p>
            <p className="voice-assistant-feedback">{feedback}</p>
            {lastCommand ? <p className="voice-assistant-command">Last: {lastCommand}</p> : null}

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
                    onClick={isSpeaking ? stopReading : readPage}
                >
                    {isSpeaking ? 'Stop Reading' : 'Read Page'}
                </button>
            </div>

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
            </ul>
        </div>
    );
};

export default VoiceAssistant;
