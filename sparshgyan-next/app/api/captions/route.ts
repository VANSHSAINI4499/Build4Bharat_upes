import { NextRequest, NextResponse } from 'next/server'

export interface CaptionSegment {
  start: number   // seconds
  dur: number     // seconds
  text: string
}

const CLIENT_VERSION = '20.10.38'
const ANDROID_UA = `com.google.android.youtube/${CLIENT_VERSION} (Linux; U; Android 14)`
const WEB_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)'

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
}

function parseTranscriptXml(xml: string): CaptionSegment[] {
  // Try srv3 format first: <p t="ms" d="ms"> with <s> sub-segments
  const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g
  const pMatches = [...xml.matchAll(pRegex)]

  if (pMatches.length > 0) {
    const segments: CaptionSegment[] = []
    for (const m of pMatches) {
      const startMs = parseInt(m[1], 10)
      const durMs = parseInt(m[2], 10)
      const inner = m[3]

      // Extract text from <s> sub-segments or use raw content
      const sParts = [...inner.matchAll(/<s[^>]*>([^<]*)<\/s>/g)]
      let text = sParts.length > 0
        ? sParts.map((s) => s[1]).join('')
        : inner.replace(/<[^>]+>/g, '')

      text = decodeEntities(text).trim()
      if (text) {
        segments.push({ start: startMs / 1000, dur: durMs / 1000, text })
      }
    }
    if (segments.length > 0) return segments
  }

  // Fallback: standard <text start="s" dur="s"> format
  const textRegex = /<text\s+start="([\d.]+)"\s+dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g
  const textMatches = [...xml.matchAll(textRegex)]
  return textMatches
    .map((m) => {
      const text = decodeEntities(m[3].replace(/<[^>]+>/g, '')).trim()
      return text ? { start: parseFloat(m[1]), dur: parseFloat(m[2]), text } : null
    })
    .filter((s): s is CaptionSegment => s !== null)
}

/**
 * GET /api/captions?v=VIDEO_ID
 *
 * Uses the YouTube ANDROID innertube client to fetch caption tracks,
 * then parses the XML into timed segments.
 */
export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get('v')
  if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: 'Missing or invalid video ID' }, { status: 400 })
  }

  try {
    // 1. Use ANDROID innertube client to get caption track URLs
    const playerRes = await fetch(
      'https://www.youtube.com/youtubei/v1/player?prettyPrint=false',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': ANDROID_UA },
        body: JSON.stringify({
          context: { client: { clientName: 'ANDROID', clientVersion: CLIENT_VERSION } },
          videoId,
        }),
      },
    )

    if (!playerRes.ok) {
      return NextResponse.json({ error: 'Failed to reach YouTube player API' }, { status: 502 })
    }

    const playerData = await playerRes.json()
    const tracks: { baseUrl: string; languageCode: string; kind?: string }[] =
      playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []

    if (!tracks.length) {
      return NextResponse.json({ error: 'No captions available for this video' }, { status: 404 })
    }

    // Prefer English, prefer manual over auto-generated
    const track =
      tracks.find((t) => t.languageCode === 'en' && t.kind !== 'asr') ??
      tracks.find((t) => t.languageCode === 'en') ??
      tracks[0]

    // 2. Fetch the caption XML
    const xmlRes = await fetch(track.baseUrl, {
      headers: { 'User-Agent': WEB_UA },
    })
    const xml = await xmlRes.text()

    // 3. Parse the XML into segments
    const segments = parseTranscriptXml(xml)

    if (!segments.length) {
      return NextResponse.json({ error: 'Caption track was empty' }, { status: 404 })
    }

    return NextResponse.json({ segments, lang: track.languageCode })
  } catch (err) {
    console.error('[captions API]', err)
    return NextResponse.json({ error: 'Failed to fetch captions' }, { status: 500 })
  }
}
