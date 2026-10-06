import { ScanRecord } from '@/types/threat'
import { EvidenceItem } from '@/types/evidence'

export function extractEvidence(scan: ScanRecord): EvidenceItem[] {
  const evidenceList: EvidenceItem[] = []
  
  // 1. Raw Payload (MESSAGE)
  evidenceList.push({
    id: `ev-msg-${scan.id}`,
    type: 'MESSAGE',
    title: 'Raw Payload',
    content: scan.raw_payload,
    source: 'User Submission',
    timestamp: scan.created_at,
    relationships: {
      signal: scan.indicators[0] || 'Unknown Signal',
      threatDna: scan.scam_category,
      attackPathNodeId: scan.journey_nodes.find(n => n.type === 'sms')?.id,
      attackPathStage: scan.journey_nodes.find(n => n.type === 'sms')?.label,
      nextMovePrediction: scan.next_moves?.[0]?.type,
      protectionAction: scan.actions.verify
    }
  })

  // 2. Journey Nodes Evidence (PHONE, URL, DOMAIN)
  scan.journey_nodes.forEach((node, i) => {
    if ((node.stage === 'OBSERVED' || node.stage === 'CURRENT') && node.evidence) {
      node.evidence.forEach((ev, j) => {
        let type: 'PHONE' | 'URL' | 'DOMAIN' | 'SIGNAL' = 'SIGNAL'
        if (node.type === 'phone') type = 'PHONE'
        if (node.type === 'url' || node.type === 'website') type = 'URL'
        
        // Find associated memory if any
        let source = 'Extracted Entity'
        if (scan.threat_memory?.some(m => m.entity.includes(ev) && !m.is_new)) {
          source = 'Threat Memory (Previously Observed)'
        }

        // Map to next moves
        const nextMove = scan.next_moves?.[0]
        
        evidenceList.push({
          id: `ev-node-${node.id}-${j}`,
          type,
          title: `Detected ${type}`,
          content: ev,
          source,
          timestamp: scan.created_at,
          relationships: {
            signal: scan.indicators[Math.min(i, scan.indicators.length - 1)] || 'Correlated Entity',
            threatDna: scan.scam_category,
            attackPathNodeId: node.id,
            attackPathStage: node.label,
            nextMovePrediction: nextMove?.type,
            protectionAction: nextMove ? nextMove.action_label : scan.actions.avoid
          }
        })
      })
    }
  })

  // 3. Threat DNA Indicators (SIGNAL)
  scan.indicators.forEach((indicator, i) => {
    evidenceList.push({
      id: `ev-ind-${i}`,
      type: 'SIGNAL',
      title: 'Heuristic Indicator',
      content: indicator,
      source: 'SafeCore AI Engine',
      timestamp: scan.created_at,
      relationships: {
        signal: indicator,
        threatDna: scan.scam_category,
        attackPathNodeId: scan.journey_nodes.find(n => n.stage === 'CURRENT')?.id,
        attackPathStage: scan.journey_nodes.find(n => n.stage === 'CURRENT')?.label,
        nextMovePrediction: scan.next_moves?.[0]?.type,
        protectionAction: scan.actions.avoid
      }
    })
  })

  return evidenceList
}
