import { NextResponse } from 'next/server'
import { JourneyNode, RiskLevel, ScanRecord, NextMovePrediction } from '@/types/threat'
import { saveScan, checkThreatMemory } from '@/lib/threat-service'

export const runtime = 'nodejs'

interface AnalyzeRequest {
  payload: string
  type: 'message' | 'url'
}

const PATTERNS = {
  BANK_KYC: /(kyc|sbi|hdfc|icici|axis|pan\s*card|bank|account\s*suspended|blocked|netbanking)/i,
  JOB_TASK: /(part[\s-]?time|youtube|like\s*video|subscribe|salary|rs\s*5000|task|hr|recruiter|telegram)/i,
  DELIVERY: /(india\s*post|ups|fedex|dhl|bluedart|delivery|package|customs|fee|held\s*at\s*depot|address\s*update)/i,
  INVESTMENT: /(crypto|bitcoin|usdt|profit|investment|double|binance|wazirx|trading|forex)/i,
  GOV_ARREST: /(cbi|trai|police|arrest|warrant|legal\s*notice|fir|supreme\s*court|cyber\s*crime|narcotics)/i,
  TECH_SUPPORT: /(anydesk|teamviewer|quicksupport|electricity\s*bill|disconnected|refund|remote\s*access)/i,
  OTP_HARVEST: /(otp|cvv|password|pin|netbanking|login|verify\s*identity|do\s*not\s*share)/i,
}

const URGENCY_TRIGGERS = /(urgent|immediately|within\s*24\s*hours|action\s*required|final\s*warning|fail\s*to|suspended)/i
const SUSPICIOUS_TLDS = /\.([a-z0-9\-]+\.)*(cc|top|xyz|vip|club|tk|ml|ga|cf|gq|link|click|ws|ru|cn)(\/|$|\s)/i
const SHORTENERS = /(bit\.ly|t\.co|tinyurl\.com|is\.gd|cutt\.ly|ow\.ly|goo\.gl|rb\.gy)/i

function extractEntities(text: string) {
  const urls = text.match(/https?:\/\/[^\s]+/ig) || []
  const phones = text.match(/(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g) || []
  return { urls, phones }
}

function normalizeUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '')
  }
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '')
}

export async function POST(req: Request) {
  try {
    const body: AnalyzeRequest = await req.json()
    const { payload, type } = body

    if (!payload || typeof payload !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const text = payload.toLowerCase()
    const { urls, phones } = extractEntities(payload)

    // Normalize for Threat Memory
    const entitySet = new Map<string, { value: string, type: 'domain' | 'phone' }>()
    urls.forEach(u => {
      const norm = normalizeUrl(u)
      if (norm) entitySet.set(norm, { value: norm, type: 'domain' })
    })
    phones.forEach(p => {
      const norm = normalizePhone(p)
      if (norm) entitySet.set(norm, { value: norm, type: 'phone' })
    })

    const threatMemoryContext = await checkThreatMemory(Array.from(entitySet.values()))

    // 1. Scoring & Categorization
    let score = 0
    const indicators: string[] = []
    let detectedCategory = 'Unknown Threat / General Spam'
    let predictedNext = 'The attacker will attempt to socially engineer you into making an irrational decision.'
    
    // For Next Move AI
    const next_moves: NextMovePrediction[] = []

    // Evaluate Archetypes
    if (PATTERNS.BANK_KYC.test(text)) {
      score += 40; detectedCategory = 'Bank / KYC Verification Fraud'; indicators.push('Banking/KYC impersonation terminology')
      predictedNext = 'Attacker will prompt you to download a fake banking APK or enter netbanking credentials on a spoofed portal.'
      next_moves.push({ type: 'Credential Request', confidence: 88, why: ['Bank impersonation detected', 'Urgency language detected', 'Credential harvesting indicators detected'], action_label: 'VERIFY INDEPENDENTLY' })
      next_moves.push({ type: 'OTP Request', confidence: 75, why: ['KYC flows typically terminate in OTP interception'], action_label: 'DO NOT SHARE OTP' })
    } else if (PATTERNS.JOB_TASK.test(text)) {
      score += 45; detectedCategory = 'Fake Job / Task Scam'; indicators.push('Part-time job / daily task bait')
      predictedNext = 'Attacker will pay a small initial "salary" to build trust, then demand a large "prepaid crypto deposit" for VIP tasks.'
      next_moves.push({ type: 'Payment Request', confidence: 91, why: ['Task scams rely on prepaid deposits for VIP tiers'], action_label: 'DO NOT DEPOSIT FUNDS' })
      next_moves.push({ type: 'Channel Switch', confidence: 85, why: ['Attacker will request moving to Telegram or WhatsApp'], action_label: 'IGNORE' })
    } else if (PATTERNS.DELIVERY.test(text)) {
      score += 35; detectedCategory = 'Fake Delivery / Courier Hold'; indicators.push('Courier/Package delivery bait')
      predictedNext = 'Attacker will ask for a tiny re-delivery fee ($1-$3) purely to harvest your credit card details.'
      next_moves.push({ type: 'Payment Request', confidence: 95, why: ['Customs/Courier scams demand immediate micro-payments'], action_label: 'DO NOT PAY' })
    } else if (PATTERNS.GOV_ARREST.test(text)) {
      score += 55; detectedCategory = 'Government Impersonation / Digital Arrest'; indicators.push('Law enforcement coercion tactics')
      predictedNext = 'Attacker will connect you to a fake "police officer" over video call and demand immediate "bail" or "clearance" funds via RTGS/Crypto.'
      next_moves.push({ type: 'Channel Switch', confidence: 92, why: ['Digital arrests transition to Skype/WhatsApp video calls'], action_label: 'DISCONNECT' })
      next_moves.push({ type: 'Payment Request', confidence: 85, why: ['Bail or clearance funds will be demanded'], action_label: 'DO NOT PAY' })
    } else if (PATTERNS.INVESTMENT.test(text)) {
      score += 45; detectedCategory = 'Investment / Crypto Scam'; indicators.push('Unrealistic financial returns promised')
      predictedNext = 'Attacker will show fake profits on a spoofed dashboard and block withdrawals until you pay hefty "tax fees".'
      next_moves.push({ type: 'Payment Request', confidence: 94, why: ['Investment portals demand tax or withdrawal fees'], action_label: 'REPORT' })
    } else if (PATTERNS.TECH_SUPPORT.test(text)) {
      score += 45; detectedCategory = 'Fake Support / Remote Access'; indicators.push('Utility/Support impersonation')
      predictedNext = 'Attacker will convince you to install AnyDesk/TeamViewer to steal OTPs right off your screen.'
      next_moves.push({ type: 'Software Installation', confidence: 96, why: ['Support scams require Remote Desktop (AnyDesk/TeamViewer)'], action_label: 'DO NOT INSTALL' })
    }

    if (PATTERNS.OTP_HARVEST.test(text)) {
      score += 30; indicators.push('Direct request for OTP/Credentials')
      if (detectedCategory === 'Unknown Threat / General Spam') detectedCategory = 'OTP / Credential Harvesting'
    }

    // Evaluate Modifiers
    if (URGENCY_TRIGGERS.test(text)) { score += 20; indicators.push('High psychological urgency') }
    if (urls.length > 0) { score += 15; indicators.push('Contains external links') }
    if (SUSPICIOUS_TLDS.test(text)) { score += 30; indicators.push('Uses suspicious top-level domain (.xyz, .top, etc)') }
    if (SHORTENERS.test(text)) { score += 20; indicators.push('Uses URL shorteners to obscure destination') }

    // Cap Score
    score = Math.min(100, Math.max(0, score + (type === 'message' ? 5 : 0)))
    if (score < 15 && urls.length === 0 && phones.length === 0) score = 0 // Baseline normalization

    // Default Next Move if none matched but high risk
    if (next_moves.length === 0 && score > 50) {
      next_moves.push({ type: 'Data Collection', confidence: 72, why: ['High risk context usually leads to data harvesting'], action_label: 'DO NOT SHARE DATA' })
    }

    // 2. Ladder Mapping
    let risk_level: RiskLevel = 'LOW'
    if (score >= 81) risk_level = 'CRITICAL'
    else if (score >= 61) risk_level = 'HIGH'
    else if (score >= 26) risk_level = 'SUSPICIOUS'

    // 3. Journey Nodes Generation (Attack Path)
    const journeyNodes: JourneyNode[] = []
    
    // Sender (OBSERVED)
    journeyNodes.push({
      id: 'node-1',
      label: phones[0] || (type === 'url' ? 'Web Source' : 'Unknown Sender'),
      type: phones.length > 0 ? 'phone' : (type === 'url' ? 'website' : 'sms'),
      status: risk_level === 'LOW' ? 'neutral' : 'warning',
      details: 'Initial contact vector',
      stage: 'OBSERVED',
      evidence: [phones[0] || 'Unknown Origin']
    })

    // Social Engineering / Hook (OBSERVED)
    journeyNodes.push({
      id: 'node-2',
      label: detectedCategory,
      type: 'sms',
      status: risk_level === 'CRITICAL' || risk_level === 'HIGH' ? 'flagged' : (risk_level === 'SUSPICIOUS' ? 'warning' : 'neutral'),
      details: 'The psychological hook',
      stage: urls.length === 0 ? 'CURRENT' : 'OBSERVED',
      evidence: [payload.substring(0, 50) + '...']
    })

    // Suspicious Link (OBSERVED/CURRENT)
    if (urls.length > 0) {
      const firstUrl = urls[0] as string
      journeyNodes.push({
        id: 'node-3',
        label: firstUrl.length > 25 ? firstUrl.substring(0, 25) + '...' : firstUrl,
        type: 'url',
        status: SUSPICIOUS_TLDS.test(firstUrl) || SHORTENERS.test(firstUrl) ? 'flagged' : 'warning',
        details: 'Redirection vector',
        stage: 'CURRENT',
        evidence: [firstUrl]
      })
      // Predicted Fake Portal
      journeyNodes.push({
        id: 'node-4',
        label: 'Possible Fake Portal',
        type: 'website',
        status: 'pending',
        details: 'Predicted exploitation interface',
        stage: 'PREDICTED'
      })
    }

    // Ultimate Goal (PREDICTED)
    if (risk_level !== 'LOW') {
      journeyNodes.push({
        id: 'node-5',
        label: next_moves[0]?.type || 'Financial / Credential Loss',
        type: next_moves[0]?.type === 'OTP Request' ? 'otp' : 'payment',
        status: 'pending',
        details: 'Predicted ultimate trap',
        stage: 'PREDICTED'
      })
    }

    // 4. Action Center
    const actions = {
      verify: risk_level === 'LOW' ? 'Verify the sender directly if you are expecting this message.' : 'Do not trust the contact info in the message. Search for the official customer service number independently.',
      avoid: 'Do NOT click any links, download attachments, or share OTPs.',
      block: phones.length > 0 ? `Block and report the number ${phones[0]} to your carrier.` : 'Mark the sender as spam in your messaging app.',
      report: 'Forward this payload to SafeCore community defense to protect others.'
    }

    const explanation = `This payload scored ${score}/100. ${
      risk_level === 'LOW' ? 'It shows no major heuristic flags, but always remain vigilant.' :
      `It was flagged primarily because it matches a known "${detectedCategory}" pattern and contains ${indicators.length} high-risk indicators.`
    }`

    // 5. Construct Record
    const newScanData: Omit<ScanRecord, 'id' | 'created_at'> = {
      scan_type: type,
      raw_payload: payload,
      risk_score: score,
      risk_level,
      scam_category: score < 20 ? 'Safe / Neutral' : detectedCategory,
      indicators,
      explanation,
      predicted_next_step: predictedNext,
      journey_nodes: journeyNodes,
      actions,
      threat_memory: threatMemoryContext,
      next_moves
    }

    // 6. Persist gracefully
    let scanResult: ScanRecord
    try {
      scanResult = await saveScan(newScanData)
    } catch {
      scanResult = {
        id: `scan-fb-${Date.now()}`,
        ...newScanData,
        created_at: new Date().toISOString()
      }
    }

    return NextResponse.json(scanResult)
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
