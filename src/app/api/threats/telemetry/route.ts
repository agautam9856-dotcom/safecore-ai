import { NextResponse } from 'next/server'
import { threatStore } from '@/lib/threat-store'

export async function GET() {
  return NextResponse.json(threatStore.telemetryStats)
}
