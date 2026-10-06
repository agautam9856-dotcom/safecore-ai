import { NextResponse } from 'next/server'
import { threatStore } from '@/lib/threat-store'
import type { CommunityReport } from '@/types/threat'

export async function GET() {
  return NextResponse.json(threatStore.communityReports)
}

export async function POST(req: Request) {
  try {
    const data: Pick<CommunityReport, 'entity_type' | 'entity_value' | 'threat_type'> = await req.json()
    
    const existing = threatStore.communityReports.find(r => r.entity_value === data.entity_value)
    if (existing) {
      existing.reports_count += 1
      existing.last_reported_at = new Date().toISOString()
    } else {
      const newReport: CommunityReport = {
        id: `cr-${Date.now()}`,
        ...data,
        reports_count: 1,
        verified_status: false,
        last_reported_at: new Date().toISOString()
      }
      threatStore.communityReports.unshift(newReport)
    }

    threatStore.telemetryStats.sentinelNodes += 1

    return NextResponse.json({ success: true, reports: threatStore.communityReports })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save report' }, { status: 400 })
  }
}
