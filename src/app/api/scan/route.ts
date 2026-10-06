import { NextResponse } from 'next/server'
import { analyzePayload } from '@/lib/threat-analyzer'
import { saveScan, checkThreatMemory } from '@/lib/threat-service'
import { ScanRecord, ScanType, RiskLevel, JourneyNode, NextMovePrediction } from '@/types/threat'
import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are a Tier-3 Cybersecurity Threat Forensics Engine. Analyze the following inbound payload (text, URL, SMS, or contact). Return a strict JSON response (do not wrap in markdown blocks, just raw JSON) with:
{
  "riskScore": integer (0-100),
  "threatLevel": "LOW" | "SUSPICIOUS" | "CRITICAL",
  "classification": string (e.g., 'BANK_KYC_PHISHING', 'TELEGRAM_ADVANCE_FEE', 'COURIER_IMPERSONATION', 'BENIGN_COMMUNICATION'),
  "scammerNextMove": string (accurate prediction of the attacker's immediate next move),
  "explainableAI": { "what": string, "why": string[], "whatNext": string[] },
  "extractedEntities": {
      "hasContact": boolean,
      "contact": string | null (ONLY if explicitly present in input, otherwise null),
      "hasUrl": boolean,
      "url": string | null (ONLY if explicitly present in input, otherwise null),
      "urgencyKeywords": string[]
  },
  "attackNodes": [ array of 5 dynamic JourneyNode objects describing the flow. Node 1 should be the sender (use 'terminal' type and "Direct User Input" label if no contact), Node 2 is the lure, Node 3 is the transport/URL, Node 4 is target infrastructure, Node 5 is extraction objective. type must be one of 'phone' | 'sms' | 'url' | 'website' | 'payment' | 'otp' | 'terminal'. status must be 'flagged' | 'warning' | 'pending' | 'neutral'. ]
}`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { payload, type = 'message' } = body as { payload: string, type: ScanType }

    if (!payload || typeof payload !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid payload' }, { status: 400 })
    }

    let scanResultBase: Omit<ScanRecord, 'id' | 'created_at'> | null = null

    // Real AI Execution (Gemini)
    const geminiKey = process.env.GEMINI_API_KEY
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } })
        
        const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nPAYLOAD TO ANALYZE:\n"${payload}"`)
        const text = result.response.text()
        const aiJson = JSON.parse(text)

        scanResultBase = {
          scan_type: type,
          raw_payload: payload,
          risk_score: aiJson.riskScore,
          risk_level: aiJson.threatLevel,
          scam_category: aiJson.classification,
          indicators: aiJson.explainableAI.why,
          explanation: `WHAT: ${aiJson.explainableAI.what}\nWHY: ${aiJson.explainableAI.why.join(' ')}\nWHAT NEXT: ${aiJson.explainableAI.whatNext.join(' ')}`,
          predicted_next_step: aiJson.scammerNextMove,
          journey_nodes: aiJson.attackNodes,
          next_moves: [
             { type: aiJson.classification, confidence: 95, why: aiJson.explainableAI.why, action_label: "PROCEED WITH CAUTION" }
          ],
          actions: {
            verify: aiJson.explainableAI.whatNext[0] || 'Verify independently.',
            avoid: 'Do not interact with suspicious links.',
            block: 'Block the sender if applicable.',
            report: 'Report this payload.'
          }
        }
      } catch (err) {
        // Silent fallback to deterministic engine
        scanResultBase = analyzePayload(payload, type)
      }
    } else {
      // Deterministic fallback
      scanResultBase = analyzePayload(payload, type)
    }

    if (!scanResultBase) {
       scanResultBase = analyzePayload(payload, type)
    }

    // Threat Memory Injection
    const extractedUrls = payload.match(/([a-z0-9|-]+\.)*[a-z0-9|-]+\.[a-z]+/gi) || []
    const extractedPhones = payload.match(/(?:\+91|91)?[6789]\d{9}\b/) || payload.match(/\+\d{1,3}[ -]?\d{6,14}\b/) || []
    
    const memoryEntities = [
      ...extractedUrls.map(u => ({ value: u, type: 'url' as const })),
      ...extractedPhones.map(p => ({ value: p, type: 'phone' as const }))
    ]
    
    const threatMemoryContext = await checkThreatMemory(memoryEntities)
    scanResultBase.threat_memory = threatMemoryContext

    let scanResult: ScanRecord
    try {
      scanResult = await saveScan(scanResultBase)
    } catch {
      scanResult = {
        id: `scan-fb-${Date.now()}`,
        ...scanResultBase,
        created_at: new Date().toISOString()
      }
    }

    return NextResponse.json(scanResult)
  } catch (error) {
    const fallback = analyzePayload('Unknown error payload', 'message')
    const finalFallback: ScanRecord = {
      id: `scan-err-${Date.now()}`,
      ...fallback,
      created_at: new Date().toISOString()
    }
    return NextResponse.json(finalFallback)
  }
}
