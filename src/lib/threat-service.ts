import { supabase, hasSupabaseConfig } from './supabase'
import type { ScanRecord, CommunityReport } from '@/types/threat'

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
    created_at: new Date().toISOString()
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
    console.warn('Supabase not configured. Using in-memory fallback for saveScan.')
    const newScan: ScanRecord = {
      ...scanData,
      id: `scan-${Date.now()}`,
      created_at: new Date().toISOString()
    }
    MOCK_SCANS.unshift(newScan)
    return newScan
  }

  const { data, error } = await supabase
    .from('scans')
    .insert([scanData])
    .select()
    .single()

  if (error) {
    console.error('Error saving scan:', error)
    throw new Error('Failed to save scan record')
  }

  return data as ScanRecord
}

export async function getRecentScans(limit = 10): Promise<ScanRecord[]> {
  if (!hasSupabaseConfig || !supabase) {
    console.warn('Supabase not configured. Returning mock recent scans.')
    return MOCK_SCANS.slice(0, limit)
  }

  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent scans:', error)
    // Fallback to mock data if table doesn't exist yet
    return MOCK_SCANS.slice(0, limit)
  }

  // If the table is empty (e.g., brand new project), fallback to mock data for demonstration
  return data.length > 0 ? (data as ScanRecord[]) : MOCK_SCANS.slice(0, limit)
}

export async function reportCommunityThreat(entity: Pick<CommunityReport, 'entity_type' | 'entity_value' | 'threat_type'>): Promise<CommunityReport> {
  if (!hasSupabaseConfig || !supabase) {
    console.warn('Supabase not configured. Using in-memory fallback for reportCommunityThreat.')
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

  // Use an upsert strategy based on entity_value
  // (Assuming entity_value is unique in the database schema)
  const { data, error } = await supabase
    .from('community_reports')
    .upsert({
      entity_type: entity.entity_type,
      entity_value: entity.entity_value,
      threat_type: entity.threat_type,
      last_reported_at: new Date().toISOString()
      // Note: Incrementing reports_count safely requires an RPC or trigger in Supabase,
      // but keeping it simple for the demo.
    }, { onConflict: 'entity_value' })
    .select()
    .single()

  if (error) {
    console.error('Error reporting community threat:', error)
    throw new Error('Failed to report threat')
  }

  return data as CommunityReport
}

export async function getCommunityIntelligence(limit = 5): Promise<CommunityReport[]> {
  if (!hasSupabaseConfig || !supabase) {
    console.warn('Supabase not configured. Returning mock community intelligence.')
    return MOCK_COMMUNITY_REPORTS.slice(0, limit)
  }

  const { data, error } = await supabase
    .from('community_reports')
    .select('*')
    .order('reports_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching community intelligence:', error)
    return MOCK_COMMUNITY_REPORTS.slice(0, limit)
  }

  return data.length > 0 ? (data as CommunityReport[]) : MOCK_COMMUNITY_REPORTS.slice(0, limit)
}
