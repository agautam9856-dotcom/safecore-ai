import { ScanRecord } from '@/types/threat'
import { SmartAlert, AlertPriority, AlertType } from '@/types/alert'

export function generateAlerts(scans: ScanRecord[]): SmartAlert[] {
  const alerts: SmartAlert[] = []
  

  // Sort scans chronological, oldest first, to calculate what changed
  const sortedScans = [...scans].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  sortedScans.forEach((scan, index) => {
    let type: AlertType = 'NEW_THREAT'
    let priority: AlertPriority = 'INFO'
    let title = 'Threat Analysis Complete'
    let summary = 'A new payload was analyzed by SafeCore.'
    const whyNow: string[] = []
    let whatChanged: SmartAlert["whatChanged"] = undefined
    let actionRecommendation = scan.actions.verify || 'Review investigation'

    const isHighRisk = scan.risk_level === 'HIGH' || scan.risk_level === 'CRITICAL'
    const hasMemory = scan.threat_memory && scan.threat_memory.length > 0 && scan.threat_memory.some(m => !m.is_new)
    
    // Determine if it's a recurring threat or escalation
    if (hasMemory) {
      type = 'RECURRING_THREAT'
      title = 'Recurring Threat Entity Detected'
      summary = 'An entity previously analyzed by SafeCore has appeared again.'
      whyNow.push('A previously observed entity appeared again.')
      priority = isHighRisk ? 'HIGH' : 'ATTENTION'
      actionRecommendation = scan.actions.avoid || actionRecommendation
    } else if (scan.risk_level === 'CRITICAL') {
      type = 'ACTION_REQUIRED'
      title = 'Critical Threat Detected'
      summary = 'A critical threat pattern was immediately identified in your recent scan.'
      whyNow.push('Immediate protective action is required.')
      priority = 'CRITICAL'
      actionRecommendation = scan.actions.block || actionRecommendation
    } else if (scan.risk_level === 'HIGH') {
      type = 'NEW_THREAT'
      title = 'High-Risk Activity Detected'
      summary = 'New evidence suggests a high-risk security event.'
      whyNow.push('A newly analyzed payload returned high-risk indicators.')
      priority = 'HIGH'
      actionRecommendation = scan.actions.avoid || actionRecommendation
    }

    // Check for escalation compared to a previous scan
    if (index > 0 && isHighRisk) {
      const prevScan = sortedScans[index - 1]
      if (prevScan.risk_score < scan.risk_score) {
        type = 'RISK_ESCALATION'
        title = 'Threat Escalated'
        summary = 'New evidence has changed the context of a recent investigation.'
        whyNow.push('Risk score increased based on new evidence.')
        priority = scan.risk_level === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
        whatChanged = {
          before: prevScan.scam_category,
          now: scan.scam_category,
          riskChange: `${prevScan.risk_score} → ${scan.risk_score}`
        }
      }
    }

    // Predictions
    if (scan.next_moves && scan.next_moves.length > 0) {
      whyNow.push(`AI predicted a possible ${scan.next_moves[0].type}.`)
      if (scan.next_moves[0].confidence > 85 && priority !== 'CRITICAL') {
        priority = 'HIGH' // Bump priority if we are very confident about a dangerous next move
      }
    }

    // New Connection (Constellation fallback trigger)
    if (scan.journey_nodes.length > 3 && !hasMemory && isHighRisk) {
      whyNow.push('Multiple entities formed a new suspicious relationship.')
    }

    if (whyNow.length === 0) {
      whyNow.push('Routine security analysis completed.')
    }

    // Deduplication: we only generate an alert if it's ATTENTION or higher, or if it's the very latest scan
    if (priority !== 'INFO' || index === sortedScans.length - 1) {
      alerts.push({
        id: `alert-${scan.id}`,
        scanId: scan.id,
        type,
        priority,
        title,
        summary,
        whyNow,
        whatChanged,
        actionRecommendation,
        isRead: false,
        timestamp: scan.created_at,
        scanRecord: scan
      })
    }
  })

  // Return newest first
  return alerts.reverse()
}

export const getPriorityColor = (p: AlertPriority) => {
  switch (p) {
    case 'CRITICAL': return 'text-threat-critical border-threat-critical bg-threat-critical/10'
    case 'HIGH': return 'text-threat-high border-threat-high bg-threat-high/10'
    case 'ATTENTION': return 'text-amber-500 border-amber-500 bg-amber-500/10'
    case 'INFO': return 'text-cyber-cyan border-cyber-cyan bg-cyber-cyan/10'
  }
}
