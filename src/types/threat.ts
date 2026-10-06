export type RiskLevel = 'LOW' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL'

export type ScanType = 'message' | 'url' | 'email' | 'qr'

export interface NextMovePrediction {
  type: string
  confidence: number
  why: string[]
  action_label: string
}

export interface JourneyNode {
  id: string
  label: string
  type: 'phone' | 'sms' | 'url' | 'website' | 'payment' | 'otp' | 'terminal'
  status: 'flagged' | 'warning' | 'pending' | 'neutral'
  details?: string
  stage?: 'OBSERVED' | 'CURRENT' | 'PREDICTED'
  evidence?: string[]
}

export interface ThreatMemoryContext {
  entity: string
  entity_type: 'domain' | 'url' | 'phone' | 'email' | 'sender'
  first_seen: string
  last_seen: string
  observation_count: number
  previous_risk: string
  previous_category: string
  previous_scan_ids: string[]
  is_new: boolean
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
  threat_memory?: ThreatMemoryContext[]
  next_moves?: NextMovePrediction[]
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
