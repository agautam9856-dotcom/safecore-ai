import { RiskLevel } from './threat'

export interface ConstellationNode {
  id: string
  label: string
  type: 'phone' | 'sms' | 'email' | 'url' | 'domain' | 'website' | 'payment' | 'otp' | 'terminal'
  risk_level: RiskLevel
  risk_score: number
  observation_count: number
  relationship_count: number
  first_seen: string
  last_seen: string
  x: number
  y: number
  details?: string
  threat_dna?: string[]
}

export type EdgeType = 'APPEARED_IN' | 'CONTAINS' | 'RESOLVES_TO' | 'REDIRECTS_TO' | 'REQUESTS' | 'PREVIOUSLY_SEEN'

export interface ConstellationEdge {
  id: string
  source: string
  target: string
  type: EdgeType
  confidence: number
  evidence: string
}

export interface ThreatCluster {
  id: string
  is_demo: boolean
  nodes: ConstellationNode[]
  edges: ConstellationEdge[]
  main_threat?: {
    category: string
    risk_level: RiskLevel
    risk_score: number
    correlation_confidence: number
    observations: number
    summary: string
    why_it_matters: string
    what_to_do: string
  }
}
