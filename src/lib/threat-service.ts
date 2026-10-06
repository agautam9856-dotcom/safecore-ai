const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

import type { ScanRecord, CommunityReport, ThreatMemoryContext } from '@/types/threat'

// --- THREAT SERVICE METHODS VIA LOCAL API ---

export async function saveScan(scanData: Omit<ScanRecord, 'id' | 'created_at'>): Promise<ScanRecord> {
  const newScan: ScanRecord = {
    ...scanData,
    id: `scan-${Date.now()}`,
    created_at: new Date().toISOString()
  }
  try {
    await fetch(`${getBaseUrl()}/api/threats/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newScan)
    })
  } catch {
    // Silent fail
  }
  return newScan
}

export async function getRecentScans(limit = 10): Promise<ScanRecord[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/threats/scans`, { next: { revalidate: 0 } })
    if (res.ok) {
      const data = await res.json()
      return data.slice(0, limit)
    }
  } catch {
    // Silent fail
  }
  return []
}

export async function getCommunityIntelligence(limit = 5): Promise<CommunityReport[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/threats/community`, { next: { revalidate: 0 } })
    if (res.ok) {
      const data = await res.json()
      return data.slice(0, limit)
    }
  } catch {
    // Silent fail
  }
  return []
}

export async function reportCommunityThreat(entity: Pick<CommunityReport, 'entity_type' | 'entity_value' | 'threat_type'>): Promise<void> {
  try {
    await fetch(`${getBaseUrl()}/api/threats/community`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entity)
    })
  } catch {
    // Silent fail
  }
}

export async function checkThreatMemory(entities: { value: string, type: 'domain' | 'url' | 'phone' | 'email' | 'sender' }[]): Promise<ThreatMemoryContext[]> {
  const memory: ThreatMemoryContext[] = []
  if (entities.length === 0) return memory

  let pool: ScanRecord[] = []
  try {
    const res = await fetch(`${getBaseUrl()}/api/threats/scans`, { next: { revalidate: 0 } })
    if (res.ok) {
      pool = await res.json()
    }
  } catch {
    // Silent fail
  }

  for (const entityObj of entities) {
    const val = entityObj.value.toLowerCase()
    
    const matches = pool.filter(scan => {
      const payloadMatch = scan.raw_payload.toLowerCase().includes(val)
      const journeyMatch = scan.journey_nodes.some(n => n.label.toLowerCase().includes(val))
      return payloadMatch || journeyMatch
    })

    if (matches.length > 0) {
      matches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      memory.push({
        entity: entityObj.value,
        entity_type: entityObj.type,
        first_seen: matches[matches.length - 1].created_at,
        last_seen: matches[0].created_at,
        observation_count: matches.length,
        previous_risk: matches[0].risk_level,
        previous_category: matches[0].scam_category,
        previous_scan_ids: matches.map(m => m.id),
        is_new: false
      })
    } else {
      memory.push({
        entity: entityObj.value,
        entity_type: entityObj.type,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        observation_count: 0,
        previous_risk: 'NONE',
        previous_category: 'NONE',
        previous_scan_ids: [],
        is_new: true
      })
    }
  }
  
  return memory
}
