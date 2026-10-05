export type RiskLevel = 'LOW' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL'

export type ScanType = 'message' | 'url' | 'email' | 'qr'

export interface JourneyNode {
  id: string
  label: string
  type: 'phone' | 'sms' | 'url' | 'website' | 'payment'
  status: 'flagged' | 'warning' | 'pending' | 'neutral'
  details?: string
}

export interface ScanRecord {
  id: string
  scan_type: ScanType
  raw_payload: string
  risk_score: number // 0-100
  risk_level: RiskLevel
  scam_category: string
  indicators: string[]
  explanation: string
  predicted_next_step: string
  journey_nodes: JourneyNode[]
  actions: {
    verify?: string
    avoid?: string
    block?: string
    report?: string
  }
  created_at: string
}

export interface CommunityReport {
  id: string
  entity_type: 'phone' | 'url' | 'domain' | 'message'
  entity_value: string
  threat_type: string
  reports_count: number
  verified_status: boolean
  last_reported_at: string
}
