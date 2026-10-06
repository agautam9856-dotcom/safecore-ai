import { ScanRecord } from '@/types/threat'
import { SecurityInsights, TrendAnalysis, TimelineEvent, TrendDirection } from '@/types/insights'

export function generateInsights(scans: ScanRecord[]): SecurityInsights | null {
  if (!scans || scans.length === 0) return null

  // Sort scans chronologically (oldest to newest for analysis, we'll reverse timeline later)
  const sortedScans = [...scans].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // 1. GENERATE TIMELINE
  const timeline: TimelineEvent[] = []
  
  sortedScans.forEach(scan => {
    // A. Base Investigation Event
    if (scan.risk_level === 'LOW') {
      timeline.push({
        id: `evt-${scan.id}-base`,
        timestamp: scan.created_at,
        type: 'SAFE_ACTIVITY',
        title: 'Safe / Neutral Interaction',
        description: `Analysis completed on ${scan.scan_type}. No immediate threat detected.`,
        severity: 'LOW',
        relatedScanId: scan.id
      })
    } else {
      timeline.push({
        id: `evt-${scan.id}-base`,
        timestamp: scan.created_at,
        type: 'THREAT_DETECTED',
        title: `Suspicious ${scan.scan_type.toUpperCase()} Detected`,
        description: `Flagged as ${scan.scam_category}. Risk Level: ${scan.risk_level}.`,
        severity: scan.risk_level,
        relatedScanId: scan.id
      })
    }

    // B. Memory Recurrence
    if (scan.threat_memory && scan.threat_memory.length > 0) {
      const recurring = scan.threat_memory.filter(m => !m.is_new)
      if (recurring.length > 0) {
        timeline.push({
          id: `evt-${scan.id}-mem`,
          // Add 1 second so it orders after the base event visually if timestamps match exactly
          timestamp: new Date(new Date(scan.created_at).getTime() + 1000).toISOString(),
          type: 'MEMORY_RECURRENCE',
          title: 'Threat Memory Triggered',
          description: `SafeCore recognized a previously observed entity: ${recurring[0].entity}.`,
          severity: scan.risk_level === 'LOW' ? 'SUSPICIOUS' : scan.risk_level,
          relatedScanId: scan.id,
          entity: recurring[0].entity
        })
      }
    }

    // C. Constellation Mapping
    if (scan.journey_nodes && scan.journey_nodes.length > 2) {
      timeline.push({
        id: `evt-${scan.id}-const`,
        timestamp: new Date(new Date(scan.created_at).getTime() + 2000).toISOString(),
        type: 'CONSTELLATION_MAPPED',
        title: 'Cross-Scan Correlation Found',
        description: `This threat was mapped to a larger constellation network involving ${scan.journey_nodes.length} nodes.`,
        severity: scan.risk_level,
        relatedScanId: scan.id
      })
    }

    // D. Predictions
    if (scan.next_moves && scan.next_moves.length > 0) {
      timeline.push({
        id: `evt-${scan.id}-pred`,
        timestamp: new Date(new Date(scan.created_at).getTime() + 3000).toISOString(),
        type: 'PREDICTION_GENERATED',
        title: 'Next Move Predicted',
        description: `AI projection: ${scan.next_moves[0].type}.`,
        severity: 'SUSPICIOUS',
        relatedScanId: scan.id
      })
    }

    // E. Action Required
    if (scan.risk_level === 'HIGH' || scan.risk_level === 'CRITICAL') {
      timeline.push({
        id: `evt-${scan.id}-act`,
        timestamp: new Date(new Date(scan.created_at).getTime() + 4000).toISOString(),
        type: 'ACTION_REQUIRED',
        title: 'Immediate Action Advised',
        description: 'Severe threat indicators identified. Avoid interaction and verify independently.',
        severity: scan.risk_level,
        relatedScanId: scan.id
      })
    }
  })

  // Sort timeline newest to oldest for display
  timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // 2. TREND ANALYSIS
  let trend: TrendAnalysis = {
    direction: 'INSUFFICIENT_DATA',
    description: 'Not enough historical data to establish a definitive trend.',
    primaryDriver: null,
    currentRiskAvg: 0,
    previousRiskAvg: 0,
    percentChange: 0
  }

  if (sortedScans.length >= 4) {
    const mid = Math.floor(sortedScans.length / 2)
    const older = sortedScans.slice(0, mid)
    const newer = sortedScans.slice(mid)
    
    const prevAvg = older.reduce((acc, s) => acc + s.risk_score, 0) / older.length
    const currAvg = newer.reduce((acc, s) => acc + s.risk_score, 0) / newer.length
    
    const diff = currAvg - prevAvg
    const percentChange = prevAvg > 0 ? (diff / prevAvg) * 100 : 0
    
    let direction: TrendDirection = 'STABLE'
    let description = 'Threat exposure remains relatively consistent with the previous period.'
    let primaryDriver = null

    if (diff > 10) {
      direction = 'INCREASING'
      description = 'Overall threat exposure is escalating.'
      
      // Determine driver
      const categoryCounts = newer.reduce((acc, s) => {
        if (s.risk_level !== 'LOW') acc[s.scam_category] = (acc[s.scam_category] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const topCat = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
      if (topCat && topCat[1] > 1) {
        primaryDriver = `Recurring ${topCat[0]} activity`
      } else {
        primaryDriver = 'Spike in isolated high-risk investigations'
      }
    } else if (diff < -10) {
      direction = 'IMPROVING'
      description = 'Threat exposure has decreased recently.'
      primaryDriver = 'Fewer high-severity investigations logged'
    }

    trend = {
      direction,
      description,
      primaryDriver,
      currentRiskAvg: Math.round(currAvg),
      previousRiskAvg: Math.round(prevAvg),
      percentChange: Math.round(percentChange)
    }
  } else if (sortedScans.length > 0) {
    const avg = sortedScans.reduce((acc, s) => acc + s.risk_score, 0) / sortedScans.length
    trend.currentRiskAvg = Math.round(avg)
  }

  // 3. AGGREGATES
  let recurringCount = 0
  const categoryCounts: Record<string, number> = {}
  
  sortedScans.forEach(s => {
    if (s.threat_memory && s.threat_memory.some(m => !m.is_new)) recurringCount++
    if (s.risk_level !== 'LOW') {
      categoryCounts[s.scam_category] = (categoryCounts[s.scam_category] || 0) + 1
    }
  })

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  return {
    trend,
    timeline,
    totalEvents: timeline.length,
    recurringThreats: recurringCount,
    topCategory,
    lastUpdated: new Date().toISOString()
  }
}
