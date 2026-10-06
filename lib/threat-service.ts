import { supabase, hasSupabaseConfig } from './supabase'
import type { ScanRecord, CommunityReport, ThreatMemoryContext } from '@/types/threat'

// --- FALLBACK MOCK DATA ---
const MOCK_SCANS: ScanRecord[] = [
  {
    id: 'scan-1001',
    scan_type: 'message',
    raw_payload: 'URGENT: Your package from UPS is held at our depot. Please pay the $2.99 shipping fee immediately here: http://track-parcel-ups-fee.com/3920',
    risk_score: 94,
    risk_level: 'CRITICAL',
    scam_category: 'Phishing / Delivery Scam',
    indicators: ['Urgency marker ("URGENT", "immediately")', 'Suspicious domain', 'Requests small payment to capture card details'],
    explanation: 'This is a classic delivery fee scam designed to steal credit card information via a fake tracking portal.',
    predicted_next_step: 'The attacker will attempt unauthorized charges on the submitted credit card within 24 hours.',
    journey_nodes: [
      { id: 'jn-1', label: '+1 (555) 019-2039', type: 'sms', status: 'flagged', details: 'Known VOIP number' },
      { id: 'jn-2', label: 'track-parcel-ups-fee.com', type: 'url', status: 'flagged', details: 'Registered 2 days ago' },
      { id: 'jn-3', label: 'Fake Payment Gateway', type: 'payment', status: 'warning', details: 'Steals CC info' }
    ],
    actions: {
      block: 'Block the sender number immediately.',
      avoid: 'Do not click the link or enter any payment information.',
      report: 'Report this SMS to your carrier by forwarding it to 7726 (SPAM).'
    },
    created_at: new Date(Date.now() - 864000000).toISOString() // 10 days ago
  }
]

const MOCK_COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'cr-1',
    entity_type: 'url',
    entity_value: 'netflix-account-verify-now.com',
    threat_type: 'Credential Harvesting',
    reports_count: 1432,
    verified_status: true,
    last_reported_at: new Date().toISOString()
  },
  {
    id: 'cr-2',
    entity_type: 'phone',
    entity_value: '+18005550199',
    threat_type: 'Tech Support Scam',
    reports_count: 854,
    verified_status: true,
    last_reported_at: new Date(Date.now() - 3600000).toISOString()
  }
]

// --- THREAT SERVICE METHODS ---

export async function saveScan(scanData: Omit<ScanRecord, 'id' | 'created_at'>): Promise<ScanRecord> {
  if (!hasSupabaseConfig || !supabase) {
    const newScan: ScanRecord = {
      ...scanData,
      id: `scan-${Date.now()}`,
      created_at: new Date().toISOString()
    }
    MOCK_SCANS.unshift(newScan)
    return newScan
  }

  try {
    const { data, error } = await supabase
      .from('scans')
      .insert([scanData])
      .select()
      .single()

    if (error) {
      throw new Error('Failed to save scan record')
    }

    // In a real app we'd keep memory sync'd. Since it's demo, we can just push to local mock array for this session so Threat Memory works instantly
    MOCK_SCANS.unshift(data as ScanRecord)

    return data as ScanRecord
  } catch {
    // If DB fails, fallback to pushing to in-memory so demo works
    const newScan: ScanRecord = {
      ...scanData,
      id: `scan-${Date.now()}`,
      created_at: new Date().toISOString()
    }
    MOCK_SCANS.unshift(newScan)
    return newScan
  }
}

export async function getRecentScans(limit = 10): Promise<ScanRecord[]> {
  if (!hasSupabaseConfig || !supabase) {
    return MOCK_SCANS.slice(0, limit)
  }

  try {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return MOCK_SCANS.slice(0, limit)
    }

    return data.length > 0 ? (data as ScanRecord[]) : MOCK_SCANS.slice(0, limit)
  } catch {
    return MOCK_SCANS.slice(0, limit)
  }
}

export async function checkThreatMemory(entities: { value: string, type: 'domain' | 'url' | 'phone' | 'email' | 'sender' }[]): Promise<ThreatMemoryContext[]> {
  const memory: ThreatMemoryContext[] = []
  
  if (entities.length === 0) return memory

  // Fetch pool of recent scans. If Supabase is connected we could do a direct DB search, but for rapid mock/demo compatibility we search the local sync'd array or a recent fetch.
  let pool = MOCK_SCANS
  if (hasSupabaseConfig && supabase) {
    try {
      const { data } = await supabase.from('scans').select('*').order('created_at', { ascending: false }).limit(50)
      if (data && data.length > 0) pool = data as ScanRecord[]
    } catch {
      pool = MOCK_SCANS
    }
  }

  for (const entityObj of entities) {
    const val = entityObj.value.toLowerCase()
    
    // Find matching past scans for this entity
    const matches = pool.filter(scan => {
      const payloadMatch = scan.raw_payload.toLowerCase().includes(val)
      const journeyMatch = scan.journey_nodes.some(n => n.label.toLowerCase().includes(val))
      return payloadMatch || journeyMatch
    })

    if (matches.length > 0) {
      // Sort matches by newest first
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

export async function reportCommunityThreat(entity: Pick<CommunityReport, 'entity_type' | 'entity_value' | 'threat_type'>): Promise<CommunityReport> {
  if (!hasSupabaseConfig || !supabase) {
    const existing = MOCK_COMMUNITY_REPORTS.find(r => r.entity_value === entity.entity_value)
    if (existing) {
      existing.reports_count++
      existing.last_reported_at = new Date().toISOString()
      return existing
    }
    const newReport: CommunityReport = {
      id: `cr-${Date.now()}`,
      ...entity,
      reports_count: 1,
      verified_status: false,
      last_reported_at: new Date().toISOString()
    }
    MOCK_COMMUNITY_REPORTS.push(newReport)
    return newReport
  }

  try {
    const { data, error } = await supabase
      .from('community_reports')
      .upsert({
        entity_type: entity.entity_type,
        entity_value: entity.entity_value,
        threat_type: entity.threat_type,
        last_reported_at: new Date().toISOString()
      }, { onConflict: 'entity_value' })
      .select()
      .single()

    if (error) {
      throw new Error('Failed to report threat')
    }

    return data as CommunityReport
  } catch {
    throw new Error('Failed to report threat')
  }
}

export async function getCommunityIntelligence(limit = 5): Promise<CommunityReport[]> {
  if (!hasSupabaseConfig || !supabase) {
    return MOCK_COMMUNITY_REPORTS.slice(0, limit)
  }

  try {
    const { data, error } = await supabase
      .from('community_reports')
      .select('*')
      .order('reports_count', { ascending: false })
      .limit(limit)

    if (error) {
      return MOCK_COMMUNITY_REPORTS.slice(0, limit)
    }

    return data.length > 0 ? (data as CommunityReport[]) : MOCK_COMMUNITY_REPORTS.slice(0, limit)
  } catch {
    return MOCK_COMMUNITY_REPORTS.slice(0, limit)
  }
}
