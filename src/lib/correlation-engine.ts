
import { ConstellationNode, ConstellationEdge, ThreatCluster, EdgeType } from '@/types/correlation'
import { getRecentScans } from './threat-service'

// Helper to normalize domains
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '')
  }
}

const LAYER_MAP: Record<string, number> = {
  'phone': 0, 'email': 0,
  'sms': 1, 'message': 1,
  'url': 2,
  'domain': 3,
  'website': 4,
  'payment': 5, 'otp': 5
}

// Engine to generate real correlations
export async function buildThreatConstellation(): Promise<ThreatCluster> {
  const scans = await getRecentScans(30)
  
  if (!scans || scans.length === 0) {
    return { id: 'empty', is_demo: false, nodes: [], edges: [] }
  }

  const nodes = new Map<string, ConstellationNode>()
  const edges = new Map<string, ConstellationEdge>()
  
  // Track relationships
  scans.forEach(scan => {
    
    
    
    // First, process journey nodes
    scan.journey_nodes.forEach((jn, i) => {
      const type = jn.type
      // We map scan's internal journey nodes to constellation nodes
      let nId = `node-${type}-${jn.label.toLowerCase()}`
      if (type === 'sms' || type === 'payment' || type === 'website') {
        // Tie abstract concepts to the scan to avoid merging all "sms" into one giant blob unless they match payload
        nId = `node-${type}-${scan.id}`
      }
      
      let existing = nodes.get(nId)
      if (!existing) {
        existing = {
          id: nId,
          label: jn.label,
          type: type as ConstellationNode["type"],
          risk_level: scan.risk_level,
          risk_score: scan.risk_score,
          observation_count: 1,
          relationship_count: 0,
          first_seen: scan.created_at,
          last_seen: scan.created_at,
          x: 0, y: 0,
          details: jn.details,
          threat_dna: scan.indicators
        }
        nodes.set(nId, existing)
      } else {
        existing.observation_count++
        if (new Date(scan.created_at) > new Date(existing.last_seen)) {
          existing.last_seen = scan.created_at
        }
      }

      // Establish linear relationships within the scan's journey
      
      

      if (i > 0) {
        const prevJn = scan.journey_nodes[i - 1]
        let prevNId = `node-${prevJn.type}-${prevJn.label.toLowerCase()}`
        if (prevJn.type === 'sms' || prevJn.type === 'payment' || prevJn.type === 'website') prevNId = `node-${prevJn.type}-${scan.id}`
        
        const edgeId = `${prevNId}->${nId}`
        if (!edges.has(edgeId)) {
          let edgeType: EdgeType = 'CONTAINS'
          let evidence = `Detected inside analysis sequence.`
          
          if (prevJn.type === 'phone' && type === 'sms') { edgeType = 'APPEARED_IN'; evidence = `Sender delivered this payload.` }
          if (prevJn.type === 'sms' && type === 'url') { edgeType = 'CONTAINS'; evidence = `Message body contained suspicious URL.` }
          if (prevJn.type === 'url' && type === 'website') { edgeType = 'RESOLVES_TO'; evidence = `URL resolves to suspected malicious portal.` }
          if (type === 'payment' ) { edgeType = 'REQUESTS'; evidence = `Destination requests sensitive data.` }
          
          edges.set(edgeId, {
            id: edgeId,
            source: prevNId,
            target: nId,
            type: edgeType,
            confidence: scan.risk_score > 80 ? 94 : 82,
            evidence
          })
          
          const srcNode = nodes.get(prevNId)
          if (srcNode) srcNode.relationship_count++
          existing.relationship_count++
        }
      }
    })

    // Add Domain Explicitly if URL exists
    const urls = scan.journey_nodes.filter(n => n.type === 'url')
    urls.forEach(u => {
      const uNId = `node-url-${u.label.toLowerCase()}`
      const domain = extractDomain(u.label)
      const dNId = `node-domain-${domain}`
      
      let dNode = nodes.get(dNId)
      if (!dNode) {
        dNode = {
          id: dNId,
          label: domain,
          type: 'domain',
          risk_level: scan.risk_level,
          risk_score: scan.risk_score,
          observation_count: 1,
          relationship_count: 1,
          first_seen: scan.created_at,
          last_seen: scan.created_at,
          x: 0, y: 0,
          details: 'Root domain of suspicious URL',
          threat_dna: scan.indicators
        }
        nodes.set(dNId, dNode)
      } else {
        dNode.observation_count++
      }

      const edgeId = `${uNId}->${dNId}`
      if (!edges.has(edgeId)) {
        edges.set(edgeId, {
          id: edgeId,
          source: uNId,
          target: dNId,
          type: 'RESOLVES_TO',
          confidence: 99,
          evidence: `URL host parsed to root domain.`
        })
        const src = nodes.get(uNId)
        if(src) src.relationship_count++
      }
    })
  })

  // Basic Layout Engine (Left to Right)
  const nodeArray = Array.from(nodes.values())
  const layers: ConstellationNode[][] = [[], [], [], [], [], []]
  
  nodeArray.forEach(n => {
    const l = LAYER_MAP[n.type] ?? 1
    layers[l].push(n)
  })

  const HORIZONTAL_SPACING = 250
  const VERTICAL_SPACING = 150
  const START_X = 50

  layers.forEach((layerNodes, layerIdx) => {
    const x = START_X + (layerIdx * HORIZONTAL_SPACING)
    const totalHeight = (layerNodes.length - 1) * VERTICAL_SPACING
    let startY = 300 - (totalHeight / 2) // center is roughly y=300
    
    layerNodes.forEach(node => {
      node.x = x
      node.y = startY
      startY += VERTICAL_SPACING
    })
  })

  // Compute Main Threat
  const criticalScans = scans.filter(s => s.risk_level === 'CRITICAL' || s.risk_level === 'HIGH')
  let main_threat = undefined
  if (criticalScans.length > 0 && edges.size > 0) {
    main_threat = {
      category: criticalScans[0].scam_category,
      risk_level: criticalScans[0].risk_level,
      risk_score: criticalScans[0].risk_score,
      correlation_confidence: edges.size > 3 ? 91 : 78,
      observations: scans.length,
      summary: `Multiple previously separate observations appear to be connected through common threat vectors and payload signatures.`,
      why_it_matters: `The signals form a cohesive progression from initial deceptive contact to a high-risk web destination, indicating an orchestrated campaign.`,
      what_to_do: `Do not interact with any of the correlated domains or sender identities. Ensure all connected indicators are blocked at the perimeter.`
    }
  }

  return {
    id: `cluster-${Date.now()}`,
    is_demo: false,
    nodes: nodeArray,
    edges: Array.from(edges.values()),
    main_threat
  }
}

// ----------------------------------------------------
// EXCEPTIONAL DEMO SCENARIO: KYC SCAM JOURNEY
// ----------------------------------------------------
export function getDemoConstellation(): ThreatCluster {
  const now = Date.now()
  const mkTime = (offsetMin: number) => new Date(now - offsetMin * 60000).toISOString()

  const nodes: ConstellationNode[] = [
    {
      id: 'd-1', label: '+91 98210-XXXXX', type: 'phone', risk_level: 'SUSPICIOUS', risk_score: 65, observation_count: 3, relationship_count: 2,
      first_seen: mkTime(120), last_seen: mkTime(10), x: 50, y: 300, details: 'Unknown Caller/Sender (VOIP)'
    },
    {
      id: 'd-2', label: 'Urgent KYC Suspension', type: 'sms', risk_level: 'HIGH', risk_score: 85, observation_count: 1, relationship_count: 2,
      first_seen: mkTime(15), last_seen: mkTime(15), x: 300, y: 300, details: 'Psychological Hook', threat_dna: ['High psychological urgency', 'Banking/KYC impersonation terminology']
    },
    {
      id: 'd-3', label: 'bit.ly/sbi-kyc-verify', type: 'url', risk_level: 'HIGH', risk_score: 88, observation_count: 5, relationship_count: 3,
      first_seen: mkTime(200), last_seen: mkTime(15), x: 550, y: 220, details: 'Obfuscated Link', threat_dna: ['Uses URL shorteners to obscure destination']
    },
    {
      id: 'd-4', label: 'sbi-update-kyc.xyz', type: 'domain', risk_level: 'CRITICAL', risk_score: 95, observation_count: 12, relationship_count: 3,
      first_seen: mkTime(1440), last_seen: mkTime(15), x: 800, y: 220, details: 'Malicious TLD Infrastructure', threat_dna: ['Uses suspicious top-level domain (.xyz, .top, etc)']
    },
    {
      id: 'd-5', label: 'Fake NetBanking Portal', type: 'website', risk_level: 'CRITICAL', risk_score: 100, observation_count: 4, relationship_count: 2,
      first_seen: mkTime(1440), last_seen: mkTime(15), x: 1050, y: 300, details: 'Spoofed Login Page', threat_dna: ['Direct request for OTP/Credentials']
    },
    {
      id: 'd-6', label: 'OTP Interception', type: 'otp', risk_level: 'CRITICAL', risk_score: 100, observation_count: 1, relationship_count: 1,
      first_seen: mkTime(15), last_seen: mkTime(15), x: 1300, y: 300, details: 'Final Extraction Layer'
    },
    {
      id: 'd-7', label: 'Previous SMS Bait', type: 'sms', risk_level: 'SUSPICIOUS', risk_score: 70, observation_count: 1, relationship_count: 2,
      first_seen: mkTime(240), last_seen: mkTime(240), x: 300, y: 150, details: 'Earlier failed lure', threat_dna: ['Contains external links']
    }
  ]

  const edges: ConstellationEdge[] = [
    { id: 'e-1', source: 'd-1', target: 'd-2', type: 'APPEARED_IN', confidence: 99, evidence: 'Sender identity verified against payload metadata.' },
    { id: 'e-2', source: 'd-2', target: 'd-3', type: 'CONTAINS', confidence: 100, evidence: 'Shortlink extracted directly from message body.' },
    { id: 'e-3', source: 'd-3', target: 'd-4', type: 'RESOLVES_TO', confidence: 94, evidence: 'Network trace resolved bit.ly redirect to .xyz domain.' },
    { id: 'e-4', source: 'd-4', target: 'd-5', type: 'RESOLVES_TO', confidence: 91, evidence: 'Domain hosts cloned banking interface.' },
    { id: 'e-5', source: 'd-5', target: 'd-6', type: 'REQUESTS', confidence: 98, evidence: 'Login sequence explicitly mandates 6-digit SMS OTP.' },
    { id: 'e-6', source: 'd-1', target: 'd-7', type: 'APPEARED_IN', confidence: 99, evidence: 'Historical correlation: sender tried a different lure earlier.' },
    { id: 'e-7', source: 'd-7', target: 'd-3', type: 'CONTAINS', confidence: 85, evidence: 'Earlier lure utilized the exact same obfuscated URL.' }
  ]

  return {
    id: 'demo-kyc-cluster',
    is_demo: true,
    nodes,
    edges,
    main_threat: {
      category: 'Bank / KYC Verification Fraud',
      risk_level: 'CRITICAL',
      risk_score: 96,
      correlation_confidence: 94,
      observations: 27,
      summary: 'Five separately documented signals confirm a sophisticated credential harvesting pipeline targeting banking users.',
      why_it_matters: 'The attacker is utilizing disposable short-links and VOIP numbers to bypass carrier filters, directing victims to a high-fidelity spoofed portal to capture live 2FA tokens.',
      what_to_do: 'Do not enter credentials. Immediately report the short-link to the domain registrar and block the sending number.'
    }
  }
}
