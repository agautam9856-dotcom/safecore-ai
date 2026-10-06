import { NextResponse } from 'next/server'
import { threatStore } from '@/lib/threat-store'
import type { ScanRecord } from '@/types/threat'

export async function GET() {
  return NextResponse.json(threatStore.recentScans)
}

export async function POST(req: Request) {
  try {
    const data: ScanRecord = await req.json()
    // Prepend to recentScans
    threatStore.recentScans.unshift(data)
    
    // Keep max 50
    if (threatStore.recentScans.length > 50) {
      threatStore.recentScans = threatStore.recentScans.slice(0, 50)
    }

    threatStore.telemetryStats.interactionsIntercepted += 1
    threatStore.telemetryStats.trajectoriesMapped += 1

    return NextResponse.json({ success: true, scan: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save scan' }, { status: 400 })
  }
}
