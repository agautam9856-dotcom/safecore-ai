import { ScanRecord, NextMovePrediction, JourneyNode, RiskLevel, ScanType } from '@/types/threat'

// --- A. ENTITY EXTRACTION REGEX ---
const REGEX = {
  DOMAIN: /https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.(xyz|top|live|click|app|link|tk|ml|cf|ga|gq|club|icu|online)/gi,
  IP: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  SHORTENER: /(bit\.ly\/[a-zA-Z0-9]+|t\.me\/[a-zA-Z0-9_]+|tinyurl\.com\/[a-zA-Z0-9]+)/gi,
  PHONE_IND: /(\+91[\-\s]?)?[6-9]\d{9}\b/g,
  TOLL_FREE: /1800\d{6,7}\b/g,
  SHORTCODE: /\b[A-Z]{2}-[A-Z0-9]{6}\b/i, 
  
  // Keywords
  BANKING: /(sbi|hdfc|icici|rbi|kyc|pan|debit card|credit card|netbanking|account blocked|suspended)/i,
  FINANCIAL: /(telegram|daily income|part time|₹|deposit|prepaid task|crypto|lottery|prize|refund)/i,
  DELIVERY: /(india post|parcel|shipment failed|electricity bill|power cut)/i,
  CREDENTIAL: /(otp|cvv|pin|verify password|share screen|download anydesk)/i,
  URGENCY: /(immediately|urgent|within 24 hours|act now|legal action|arrest warrant)/i,
}

export function analyzePayload(payload: string, type: ScanType = 'message'): Omit<ScanRecord, 'id' | 'created_at'> {
  let calculatedScore = 5
  const indicators: string[] = []

  // Extract Contacts
  let extractedContact = "Unspecified Origin / Raw Text"
  const phones = payload.match(REGEX.PHONE_IND) || payload.match(REGEX.TOLL_FREE) || []
  const shortcodes = payload.match(REGEX.SHORTCODE) || []
  if (shortcodes.length > 0) extractedContact = shortcodes[0] as string
  else if (phones.length > 0) extractedContact = phones[0] as string

  // Extract Domains
  let extractedDomain = "No External URL Detected"
  const urls = payload.match(REGEX.DOMAIN) || payload.match(REGEX.SHORTENER) || []
  const ips = payload.match(REGEX.IP) || []
  if (urls.length > 0) extractedDomain = urls[0] as string
  else if (ips.length > 0) extractedDomain = ips[0] as string

  // Feature matching
  const hasRiskTld = REGEX.DOMAIN.test(payload) || ips.length > 0 || REGEX.SHORTENER.test(payload)
  const hasBank = REGEX.BANKING.test(payload)
  const hasUrgency = REGEX.URGENCY.test(payload)
  const hasCredential = REGEX.CREDENTIAL.test(payload)
  const hasFinancial = REGEX.FINANCIAL.test(payload)
  const hasDelivery = REGEX.DELIVERY.test(payload)
  const hasShortcodeLink = (shortcodes.length > 0 || extractedContact === "Unspecified Origin / Raw Text") && extractedDomain !== "No External URL Detected"

  // B. Dynamic Score Calculation Formula
  if (hasRiskTld && extractedDomain !== "No External URL Detected") {
    calculatedScore += 35
    indicators.push(`Suspicious URL/IP detected: ${extractedDomain}`)
  }
  if (hasBank) {
    calculatedScore += 30
    indicators.push(`Bank/Corporate impersonation keywords`)
  }
  if (hasUrgency) {
    calculatedScore += 20
    indicators.push(`Urgency / coercion language used`)
  }
  if (hasCredential) {
    calculatedScore += 25
    indicators.push(`Explicit credential extortion (OTP/CVV/Password)`)
  }
  if (hasShortcodeLink) {
    calculatedScore += 15
    indicators.push(`Unverified origin supplying an external link`)
  }
  if (hasFinancial) {
    calculatedScore += 20
    indicators.push(`Financial trap / advance fee keywords`)
  }
  if (hasDelivery) {
    calculatedScore += 20
    indicators.push(`Delivery / utility phishing bait`)
  }

  // Cap Score
  const finalScore = Math.min(99, Math.max(5, calculatedScore))

  // Risk Categorization
  let threatLevel: RiskLevel = 'LOW'
  
  
  if (finalScore >= 65) {
    threatLevel = 'CRITICAL'
    
  } else if (finalScore >= 25) {
    threatLevel = 'SUSPICIOUS'
    
  }

  // C. Dynamic Explainable AI (XAI) Synthesis
  let threatCategory = 'BENIGN_COMMUNICATION'
  if (finalScore >= 25) {
    if (hasBank) threatCategory = 'BANK_IMPERSONATION'
    else if (hasFinancial) threatCategory = 'ADVANCE_FEE_TASK_SCAM'
    else if (hasDelivery) threatCategory = 'COURIER_PHISHING'
    else threatCategory = 'UNKNOWN_THREAT_VECTOR'
  }

  const explanation = threatLevel === 'LOW'
    ? `WHAT: BENIGN_COMMUNICATION\nWHY: Analyzed contact "${extractedContact}" and domain "${extractedDomain}". No high-risk triggers detected.\nWHAT NEXT: Safe to proceed, but remain vigilant.`
    : `WHAT: ${threatCategory}\nWHY: Detected origin "${extractedContact}" sending link "${extractedDomain}". Triggered by ${indicators.length} adversarial markers.\nWHAT NEXT: Do not click the link or provide requested information.`

  let predictedNext = 'Attacker may transition to a more aggressive request.'
  const next_moves: NextMovePrediction[] = []

  if (threatCategory === 'BANK_IMPERSONATION' || hasCredential) {
    predictedNext = 'Victim will be redirected to a spoofed portal to intercept OTP/NetBanking credentials.'
    next_moves.push({ type: 'OTP Interception', confidence: 95, why: ['Credential requests typically lead to OTP theft'], action_label: 'DO NOT SHARE OTP' })
  } else if (threatCategory === 'ADVANCE_FEE_TASK_SCAM') {
    predictedNext = 'Victim will be asked to pay an upfront "deposit" via UPI on Telegram/WhatsApp to unlock fictitious earnings.'
    next_moves.push({ type: 'Direct UPI Transfer', confidence: 90, why: ['Task platforms demand VIP prepaid deposits'], action_label: 'DO NOT DEPOSIT' })
  } else if (threatCategory === 'COURIER_PHISHING') {
    predictedNext = 'Victim will be asked to pay a tiny redelivery fee to harvest full credit card (CVV) data.'
    next_moves.push({ type: 'CVV Harvest', confidence: 92, why: ['Micro-fees are used to steal card details'], action_label: 'DO NOT PAY' })
  }

  if (next_moves.length === 0 && threatLevel !== 'LOW') {
    next_moves.push({ type: 'Data Harvesting', confidence: 70, why: ['Suspicious vectors usually attempt to harvest PII'], action_label: 'AVOID ENGAGEMENT' })
  }

  // 3. FULLY REACTIVE 5-NODE ATTACK GRAPH
  const journeyNodes: JourneyNode[] = []

  // Node 1: Origin
  journeyNodes.push({
    id: 'node-1',
    label: extractedContact,
    type: shortcodes.length > 0 ? 'sms' : (phones.length > 0 ? 'phone' : 'sms'),
    status: threatLevel === 'LOW' ? 'neutral' : (shortcodes.length > 0 ? 'warning' : 'flagged'),
    details: 'Origin Identity',
    stage: 'OBSERVED',
    evidence: [extractedContact]
  })

  // Node 2: Bait Hook
  let baitLabel = 'Casual Inquiry'
  if (threatLevel !== 'LOW') {
    if (hasBank) baitLabel = 'Urgent KYC Suspension'
    else if (hasFinancial) baitLabel = 'Task Recruitment'
    else if (hasDelivery) baitLabel = 'Delivery Failure'
    else baitLabel = 'Unknown Lure'
  }
  journeyNodes.push({
    id: 'node-2',
    label: baitLabel,
    type: 'sms',
    status: threatLevel === 'CRITICAL' ? 'flagged' : (threatLevel === 'LOW' ? 'neutral' : 'warning'),
    details: 'Detected Hook Category',
    stage: 'OBSERVED',
    evidence: []
  })

  // Node 3: Vector / Transport
  journeyNodes.push({
    id: 'node-3',
    label: extractedDomain,
    type: extractedDomain === 'No External URL Detected' ? 'sms' : 'url',
    status: extractedDomain === 'No External URL Detected' ? 'neutral' : (hasRiskTld ? 'flagged' : 'warning'),
    details: 'Transport Vector',
    stage: 'CURRENT',
    evidence: [extractedDomain]
  })

  // Node 4: Target Infrastructure
  let targetLabel = 'Direct Communication'
  if (threatLevel !== 'LOW') {
    if (threatCategory === 'BANK_IMPERSONATION') targetLabel = 'Fake NetBanking Portal'
    else if (threatCategory === 'ADVANCE_FEE_TASK_SCAM') targetLabel = 'Telegram Chatroom'
    else if (threatCategory === 'COURIER_PHISHING') targetLabel = 'Deceptive APK'
    else if (extractedDomain !== 'No External URL Detected') targetLabel = 'Malicious Web Portal'
  }
  journeyNodes.push({
    id: 'node-4',
    label: targetLabel,
    type: 'website',
    status: threatLevel === 'LOW' ? 'neutral' : 'pending',
    details: 'Destination Infrastructure',
    stage: threatLevel === 'LOW' ? 'OBSERVED' : 'PREDICTED'
  })

  // Node 5: Extraction Objective
  let objectiveLabel = 'No Threat Detected'
  if (threatLevel !== 'LOW') {
    if (threatCategory === 'BANK_IMPERSONATION') objectiveLabel = 'OTP Interception'
    else if (threatCategory === 'ADVANCE_FEE_TASK_SCAM') objectiveLabel = 'Direct UPI Transfer'
    else if (threatCategory === 'COURIER_PHISHING') objectiveLabel = 'CVV Harvest'
    else objectiveLabel = 'Data Harvesting'
  }
  journeyNodes.push({
    id: 'node-5',
    label: objectiveLabel,
    type: threatLevel === 'LOW' ? 'sms' : 'otp',
    status: threatLevel === 'LOW' ? 'neutral' : 'pending',
    details: 'Threat Objective',
    stage: threatLevel === 'LOW' ? 'OBSERVED' : 'PREDICTED'
  })

  return {
    scan_type: type,
    raw_payload: payload,
    risk_score: finalScore,
    risk_level: threatLevel,
    scam_category: threatCategory,
    indicators,
    explanation,
    predicted_next_step: predictedNext,
    journey_nodes: journeyNodes,
    next_moves,
    threat_memory: [],
    actions: {
      verify: threatLevel === 'LOW' ? 'Safe to proceed.' : 'Verify independently via official channels.',
      avoid: threatLevel === 'LOW' ? 'None.' : 'Do not click links or install files.',
      block: threatLevel === 'LOW' ? 'Not necessary.' : 'Block the sender.',
      report: 'Report this payload.'
    }
  }
}
