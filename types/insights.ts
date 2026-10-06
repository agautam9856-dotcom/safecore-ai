

export type TrendDirection = 'IMPROVING' | 'STABLE' | 'INCREASING' | 'INSUFFICIENT_DATA'

export interface TrendAnalysis {
  direction: TrendDirection
  description: string
  primaryDriver: string | null
  currentRiskAvg: number
  previousRiskAvg: number
  percentChange: number
}

export type TimelineEventType = 
  | 'THREAT_DETECTED'
  | 'SAFE_ACTIVITY'
  | 'MEMORY_RECURRENCE'
  | 'CONSTELLATION_MAPPED'
  | 'PREDICTION_GENERATED'
  | 'ACTION_REQUIRED'

export interface TimelineEvent {
  id: string
  timestamp: string
  type: TimelineEventType
  title: string
  description: string
  severity: 'LOW' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL'
  relatedScanId: string
  entity?: string
}

export interface SecurityInsights {
  trend: TrendAnalysis
  timeline: TimelineEvent[]
  totalEvents: number
  recurringThreats: number
  topCategory: string | null
  lastUpdated: string
}
