import { NextResponse } from 'next/server'
import { saveScan } from '@/lib/threat-service'
import type { RiskLevel, ScanRecord, JourneyNode, ScanType } from '@/types/threat'

interface AnalyzeRequest {
  payload: string
  type: ScanType
}

// --- HEURISTICS PATTERNS ---
const PATTERNS = {
  BANK_KYC: /(kyc|pan\s*card|bank|account|suspended|blocked|sbi|hdfc|icici|axis|dear\s*customer|update\s*immediately)/i,
  JOB_TASK: /(part[\s-]*time|daily\s*tasks|work\s*from\s*home|telegram|recruitment|salary|youtube\s*likes|prepaid\s*task)/i,
  DELIVERY: /(delivery|undelivered|package|courier|held|post|fedex|dhl|customs|shipping\s*fee)/i,
  INVESTMENT: /(crypto|doubler|guaranteed\s*returns|investment|trading\s*app|bitcoin|usdt|profit|wallet)/i,
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

export async function POST(req: Request) {
  try {
    const body: AnalyzeRequest = await req.json()
    const { payload, type } = body

    if (!payload || typeof payload !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const text = payload.toLowerCase()
    const { urls, phones } = extractEntities(payload)

    // 1. Scoring & Categorization
    let score = 0
    const indicators: string[] = []
    let detectedCategory = 'Unknown Threat / General Spam'
    let predictedNext = 'The attacker will attempt to socially engineer you into making an irrational decision.'

    // Evaluate Archetypes
    if (PATTERNS.BANK_KYC.test(text)) {
      score += 40; detectedCategory = 'Bank / KYC Verification Fraud'; indicators.push('Banking/KYC impersonation terminology')
      predictedNext = 'Attacker will prompt you to download a fake banking APK or enter netbanking credentials on a spoofed portal.'
    } else if (PATTERNS.JOB_TASK.test(text)) {
      score += 45; detectedCategory = 'Fake Job / Task Scam'; indicators.push('Part-time job / daily task bait')
      predictedNext = 'Attacker will pay a small initial "salary" to build trust, then demand a large "prepaid crypto deposit" for VIP tasks.'
    } else if (PATTERNS.DELIVERY.test(text)) {
      score += 35; detectedCategory = 'Fake Delivery / Courier Hold'; indicators.push('Courier/Package delivery bait')
      predictedNext = 'Attacker will ask for a tiny re-delivery fee ($1-$3) purely to harvest your credit card details.'
    } else if (PATTERNS.GOV_ARREST.test(text)) {
      score += 55; detectedCategory = 'Government Impersonation / Digital Arrest'; indicators.push('Law enforcement coercion tactics')
      predictedNext = 'Attacker will connect you to a fake "police officer" over video call and demand immediate "bail" or "clearance" funds via RTGS/Crypto.'
    } else if (PATTERNS.INVESTMENT.test(text)) {
      score += 45; detectedCategory = 'Investment / Crypto Scam'; indicators.push('Unrealistic financial returns promised')
      predictedNext = 'Attacker will show fake profits on a spoofed dashboard and block withdrawals until you pay hefty "tax fees".'
    } else if (PATTERNS.TECH_SUPPORT.test(text)) {
      score += 45; detectedCategory = 'Fake Support / Remote Access'; indicators.push('Utility/Support impersonation')
      predictedNext = 'Attacker will convince you to install AnyDesk/TeamViewer to steal OTPs right off your screen.'
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

    // 2. Ladder Mapping
    let risk_level: RiskLevel = 'LOW'
    if (score >= 81) risk_level = 'CRITICAL'
    else if (score >= 61) risk_level = 'HIGH'
    else if (score >= 26) risk_level = 'SUSPICIOUS'

    // 3. Journey Nodes Generation
    const journeyNodes: JourneyNode[] = []
    const senderNode: JourneyNode = {
      id: 'node-1',
      label: phones[0] || (type === 'url' ? 'Web Source' : 'Unknown Sender'),
      type: phones.length > 0 ? 'phone' : (type === 'url' ? 'website' : 'sms'),
      status: risk_level === 'LOW' ? 'neutral' : 'warning',
      details: 'Initial contact vector'
    }
    journeyNodes.push(senderNode)

    const baitNode: JourneyNode = {
      id: 'node-2',
      label: detectedCategory,
      type: 'sms',
      status: risk_level === 'CRITICAL' || risk_level === 'HIGH' ? 'flagged' : (risk_level === 'SUSPICIOUS' ? 'warning' : 'neutral'),
      details: 'The psychological hook'
    }
    journeyNodes.push(baitNode)

    if (urls.length > 0) {
      const firstUrl = urls[0] as string
      journeyNodes.push({
        id: 'node-3',
        label: firstUrl.length > 25 ? firstUrl.substring(0, 25) + '...' : firstUrl,
        type: 'url',
        status: SUSPICIOUS_TLDS.test(firstUrl) || SHORTENERS.test(firstUrl) ? 'flagged' : 'warning',
        details: 'Redirection vector'
      })
      journeyNodes.push({
        id: 'node-4',
        label: 'Phishing / Fake Portal',
        type: 'website',
        status: risk_level === 'CRITICAL' ? 'flagged' : 'warning',
        details: 'Exploitation interface'
      })
    }

    if (risk_level !== 'LOW') {
      journeyNodes.push({
        id: 'node-5',
        label: 'Financial / Credential Loss',
        type: 'payment',
        status: 'pending', // Always pending as it's the future goal
        details: 'The ultimate trap'
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
      actions
    }

    // 6. Persist gracefully
    let scanResult: ScanRecord
    try {
      scanResult = await saveScan(newScanData)
    } catch (dbError) {
      console.error('Database error, falling back to memory response:', dbError)
      // Fallback response so API never fails externally
      scanResult = {
        id: `scan-fb-${Date.now()}`,
        ...newScanData,
        created_at: new Date().toISOString()
      }
    }

    return NextResponse.json(scanResult)
  } catch (error) {
    console.error('Analyze API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error processing payload' }, { status: 500 })
  }
}
