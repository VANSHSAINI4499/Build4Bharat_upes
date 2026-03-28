// Web Speech API - not in all TypeScript lib definitions
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

declare var SpeechRecognition: {
  new (): SpeechRecognition
}

// Web Serial API
interface SerialPortInfo {
  usbVendorId?: number
  usbProductId?: number
}

interface SerialPortRequestOptions {
  filters?: SerialPortInfo[]
}

interface SerialOptions {
  baudRate: number
  dataBits?: number
  stopBits?: number
  parity?: 'none' | 'even' | 'odd'
  bufferSize?: number
  flowControl?: 'none' | 'hardware'
}

interface SerialPort {
  open(options: SerialOptions): Promise<void>
  close(): Promise<void>
  readonly readable: ReadableStream<Uint8Array>
  readonly writable: WritableStream<Uint8Array>
  getInfo(): SerialPortInfo
}

interface Serial extends EventTarget {
  requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>
  getPorts(): Promise<SerialPort[]>
}

interface Navigator {
  readonly serial: Serial
}
