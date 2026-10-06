


export type ProtectionLevel = 'LOW EXPOSURE' | 'MODERATE EXPOSURE' | 'ELEVATED EXPOSURE' | 'HIGH EXPOSURE' | 'CRITICAL'

export interface ThreatPattern {
  name: string
  count: number
  description: string
  commonSignals: string[]
}

export interface SafetyRecommendation {
  type: 'VERIFY' | 'AVOID' | 'REVIEW' | 'WATCH'
  title: string
  description: string
  actionLabel: string
  targetId?: string
}

export interface RiskTrend {
  direction: 'INCREASING' | 'DECREASING' | 'STABLE'
  description: string
  comparison: {
    previousRiskAvg: number
    currentRiskAvg: number
  }
}

export interface SafetyProfile {
  lastUpdated: string
  protectionLevel: ProtectionLevel
  exposureIndex: number
  
  stats: {
    totalInvestigations: number
    highRiskInvestigations: number
    recurringThreats: number
    connectedClusters: number
    requiredActions: number
    activeAlerts: number
  }

  threatExposure: Array<{ category: string; count: number; percentage: number }>
  mostCommonThreat: ThreatPattern | null
  
  recurringEntities: Array<{ entity: string; count: number; type: string }>
  patterns: ThreatPattern[]
  
  channelExposure: Array<{ channel: string; percentage: number; count: number }>
  
  riskTrend: RiskTrend
  recommendations: SafetyRecommendation[]
}
