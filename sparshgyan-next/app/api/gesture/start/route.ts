import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const res = await fetch('http://localhost:5000/api/start-mouse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    const data: unknown = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json(
      { error: 'Gesture service unavailable. Start the Flask server first.' },
      { status: 503 }
    )
  }
}
