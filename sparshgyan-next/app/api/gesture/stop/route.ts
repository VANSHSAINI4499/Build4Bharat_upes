import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const res = await fetch('http://localhost:5000/api/stop-mouse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    const data: unknown = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    // Stopping is best-effort — always return success to the client
    return NextResponse.json({ ok: true, note: 'Service was already stopped or not running.' })
  }
}
