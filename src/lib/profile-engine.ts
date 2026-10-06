import { ScanRecord } from '@/types/threat'
import { SmartAlert } from '@/types/alert'
import { SafetyProfile, ProtectionLevel, ThreatPattern, RiskTrend, SafetyRecommendation } from '@/types/profile'

export function generateSafetyProfile(scans: ScanRecord[], alerts: SmartAlert[]): SafetyProfile | null {
  if (!scans || scans.length === 0) return null

  const now = new Date().toISOString()
  const activeAlerts = alerts.filter(a => !a.isRead)

  // 1. Core Stats
  const totalInvestigations = scans.length
  const highRiskInvestigations = scans.filter(s => s.risk_level === 'HIGH' || s.risk_level === 'CRITICAL').length
  const connectedClusters = scans.filter(s => s.journey_nodes.length > 3).length
  
  let recurringThreats = 0
  const recurringEntityMap = new Map<string, { count: number, type: string }>()
  
  scans.forEach(s => {
    if (s.threat_memory) {
      s.threat_memory.forEach(m => {
        if (!m.is_new) {
          recurringThreats++
          const count = recurringEntityMap.get(m.entity)?.count || 0
          recurringEntityMap.set(m.entity, { count: count + 1, type: m.entity_type })
        }
      })
    }
  })

  const recurringEntities = Array.from(recurringEntityMap.entries())
    .map(([entity, data]) => ({ entity, count: data.count, type: data.type }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // 2. Exposure Index & Protection Level
  let exposureScore = 0
  if (totalInvestigations > 0) {
    const avgRisk = scans.reduce((acc, s) => acc + s.risk_score, 0) / totalInvestigations
    const highRiskPenalty = (highRiskInvestigations / totalInvestigations) * 20
    const recurringPenalty = Math.min(recurringThreats * 5, 20)
    exposureScore = Math.min(100, Math.max(0, avgRisk + highRiskPenalty + recurringPenalty))
  }

  let protectionLevel: ProtectionLevel = 'LOW EXPOSURE'
  if (exposureScore >= 80) protectionLevel = 'CRITICAL'
  else if (exposureScore >= 60) protectionLevel = 'HIGH EXPOSURE'
  else if (exposureScore >= 35) protectionLevel = 'ELEVATED EXPOSURE'
  else if (exposureScore >= 15) protectionLevel = 'MODERATE EXPOSURE'

  // 3. Threat Exposure (Categories)
  const categoryMap = new Map<string, number>()
  scans.forEach(s => {
    if (s.scam_category !== 'Safe / Neutral') {
      categoryMap.set(s.scam_category, (categoryMap.get(s.scam_category) || 0) + 1)
    }
  })
  
  const threatExposure = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count, percentage: Math.round((count / Math.max(1, totalInvestigations)) * 100) }))
    .sort((a, b) => b.count - a.count)

  // 4. Most Common Threat & Patterns
  let mostCommonThreat: ThreatPattern | null = null
  if (threatExposure.length > 0) {
    const commonCat = threatExposure[0].category
    const relatedScans = scans.filter(s => s.scam_category === commonCat)
    
    // Extract most frequent signals for this category
    const signalMap = new Map<string, number>()
    relatedScans.forEach(s => {
      s.indicators.forEach(ind => signalMap.set(ind, (signalMap.get(ind) || 0) + 1))
    })
    const commonSignals = Array.from(signalMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4).map(e => e[0])
    
    mostCommonThreat = {
      name: commonCat,
      count: threatExposure[0].count,
      description: 'This pattern appears frequently in your recent history.',
      commonSignals
    }
  }

  const patterns: ThreatPattern[] = []
  const urgencyCount = scans.filter(s => s.indicators.some(i => i.toLowerCase().includes('urgency'))).length
  if (urgencyCount > 0) {
    patterns.push({ name: 'URGENCY PRESSURE', count: urgencyCount, description: 'High psychological urgency is being used to force quick decisions.', commonSignals: ['Urgency terminology', 'Time limits'] })
  }
  const credentialCount = scans.filter(s => s.indicators.some(i => i.toLowerCase().includes('credential') || i.toLowerCase().includes('otp'))).length
  if (credentialCount > 0) {
    patterns.push({ name: 'CREDENTIAL HARVESTING', count: credentialCount, description: 'Attempts to steal passwords or OTPs.', commonSignals: ['Fake login portals', 'OTP requests'] })
  }

  // 5. Channel Exposure
  const channelMap = new Map<string, number>()
  scans.forEach(s => {
    const ch = s.scan_type === 'url' ? 'Website' : (s.scan_type === 'message' ? 'SMS/Message' : s.scan_type)
    channelMap.set(ch, (channelMap.get(ch) || 0) + 1)
  })
  const channelExposure = Array.from(channelMap.entries())
    .map(([channel, count]) => ({ channel, count, percentage: Math.round((count / totalInvestigations) * 100) }))
    .sort((a, b) => b.count - a.count)

  // 6. Risk Trend
  let riskTrend: RiskTrend = { direction: 'STABLE', description: 'Your recent activity is broadly consistent.', comparison: { previousRiskAvg: 0, currentRiskAvg: 0 } }
  if (scans.length >= 2) {
    // Split scans roughly in half chronologically
    const sorted = [...scans].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const mid = Math.floor(sorted.length / 2)
    const older = sorted.slice(0, mid)
    const newer = sorted.slice(mid)
    
    const prevAvg = older.length > 0 ? (older.reduce((a, b) => a + b.risk_score, 0) / older.length) : 0
    const currAvg = newer.length > 0 ? (newer.reduce((a, b) => a + b.risk_score, 0) / newer.length) : 0
    
    const diff = currAvg - prevAvg
    if (diff > 15) {
      riskTrend = { direction: 'INCREASING', description: 'New high-risk investigations were detected compared with the previous period.', comparison: { previousRiskAvg: Math.round(prevAvg), currentRiskAvg: Math.round(currAvg) } }
    } else if (diff < -15) {
      riskTrend = { direction: 'DECREASING', description: 'Fewer suspicious investigations were recorded recently.', comparison: { previousRiskAvg: Math.round(prevAvg), currentRiskAvg: Math.round(currAvg) } }
    } else {
      riskTrend = { direction: 'STABLE', description: 'Your recent activity is broadly consistent with the previous period.', comparison: { previousRiskAvg: Math.round(prevAvg), currentRiskAvg: Math.round(currAvg) } }
    }
  }

  // 7. Recommendations
  const recommendations: SafetyRecommendation[] = []
  if (recurringEntities.length > 0) {
    recommendations.push({
      type: 'VERIFY',
      title: 'Review recurring entity',
      description: `${recurringEntities[0].entity} has appeared in multiple related investigations.`,
      actionLabel: 'Inspect Entity'
    })
  }
  if (activeAlerts.length > 0) {
    recommendations.push({
      type: 'REVIEW',
      title: 'Unresolved Alerts',
      description: `You have ${activeAlerts.length} high-priority alerts awaiting review.`,
      actionLabel: 'Open Alert Center'
    })
  }
  const scansWithPredictions = scans.filter(s => s.next_moves && s.next_moves.length > 0 && (s.risk_level === 'HIGH' || s.risk_level === 'CRITICAL'))
  if (scansWithPredictions.length > 0) {
    recommendations.push({
      type: 'WATCH',
      title: 'AI Predicted Stage',
      description: `A threat journey is projected to move into a ${scansWithPredictions[0].next_moves![0].type} stage.`,
      actionLabel: 'View Attack Path'
    })
  }
  if (recommendations.length === 0 && highRiskInvestigations > 0) {
    recommendations.push({
      type: 'AVOID',
      title: 'High-Risk Links',
      description: 'Your recent scans contain severe threats. Avoid interacting with external links.',
      actionLabel: 'Review Evidence'
    })
  }

  return {
    lastUpdated: now,
    protectionLevel,
    exposureIndex: Math.round(exposureScore),
    stats: {
      totalInvestigations,
      highRiskInvestigations,
      recurringThreats,
      connectedClusters,
      requiredActions: recommendations.length,
      activeAlerts: activeAlerts.length
    },
    threatExposure,
    mostCommonThreat,
    recurringEntities,
    patterns,
    channelExposure,
    riskTrend,
    recommendations
  }
}
