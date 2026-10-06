import { NextResponse } from 'next/server'
import dns from 'dns/promises'

export async function POST(req: Request) {
  try {
    const { domain } = await req.json()
    
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 400 })
    }

    // Protection: Block localhost/internal lookups
    const lowerDomain = domain.toLowerCase()
    const forbidden = ['localhost', '127.0.0.1', '0.0.0.0', '10.', '172.16.', '192.168.', '169.254.', '::1', '.local']
    if (forbidden.some(f => lowerDomain.includes(f))) {
      return NextResponse.json({ error: 'Internal domain lookup restricted' }, { status: 403 })
    }

    let ips: string[] = []
    let mxRecords: { exchange: string, priority: number }[] = []
    let txtRecords: string[][] = []

    try {
      ips = await dns.resolve4(domain)
    } catch { /* silent fail */ }

    try {
      mxRecords = await dns.resolveMx(domain)
    } catch { /* silent fail */ }
    
    try {
      txtRecords = await dns.resolveTxt(domain)
    } catch { /* silent fail */ }

    return NextResponse.json({
      domain,
      status: 'success',
      ips,
      hasMx: mxRecords.length > 0,
      hasTxt: txtRecords.length > 0,
      timestamp: new Date().toISOString()
    })
    
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve domain intelligence' }, { status: 500 })
  }
}
