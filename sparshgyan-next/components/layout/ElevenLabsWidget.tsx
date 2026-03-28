'use client'

import Script from 'next/script'

export function ElevenLabsWidget() {
  return (
    <>
      <elevenlabs-convai agent-id="agent_4501kmtgxcy8ehn8dhnrx7fh8e5n" />
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="lazyOnload"
      />
    </>
  )
}
