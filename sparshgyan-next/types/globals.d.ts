// Web Speech API - not in all TypeScript lib definitions
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  pause?(): void;
  resume?(): void;
  abort(): void;
}

declare var SpeechRecognition: {
  new (): SpeechRecognition;
};

// Web Serial API
interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialPortRequestOptions {
  filters?: SerialPortInfo[];
}

interface SerialOptions {
  baudRate: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

interface SerialPort {
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<Uint8Array>;
  getInfo(): SerialPortInfo;
}

interface Serial extends EventTarget {
  requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
}

interface Navigator {
  readonly serial: Serial;
}

interface SparshSpeechController {
  start: () => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

interface Window {
  __sparshSpeechController?: SparshSpeechController;
}

// ElevenLabs Conversational AI widget custom element
declare namespace JSX {
  interface IntrinsicElements {
    'elevenlabs-convai': {
      'agent-id'?: string;
      class?: string;
      style?: string;
      [key: string]: unknown;
    };
  }
}
