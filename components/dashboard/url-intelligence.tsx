"use client"
import { useState, useEffect } from 'react'

import { Globe, Link as LinkIcon, Search, ShieldAlert, CheckCircle, AlertTriangle, ArrowRight, Activity, Clock, Server, Eye, ExternalLink } from 'lucide-react'
import { ScanRecord } from '@/types/threat'
import { analyzeUrl, extractUrlsFromText, UrlIntelligence } from '@/lib/url-utils'
import { GlassCard } from '@/components/ui/glass-card'
import { playCyberClick } from '@/lib/audio'
import Link from 'next/link'

export function UrlIntelligenceLab({ scan }: { scan: ScanRecord }) {
  const [intel, setIntel] = useState<UrlIntelligence | null>(null)
  const [domainData, setDomainData] = useState<{ ips: string[], hasMx: boolean, hasTxt: boolean } | null>(null)
  const [isLoadingDomain, setIsLoadingDomain] = useState(false)
  
  // Find URL to analyze
  useEffect(() => {
    let targetUrl = ''
    if (scan.scan_type === 'url') {
      targetUrl = scan.raw_payload
    } else {
      const urls = extractUrlsFromText(scan.raw_payload)
      if (urls.length > 0) targetUrl = urls[0]
    }

    if (targetUrl) {
      const parsed = analyzeUrl(targetUrl)
      setIntel(parsed)
      
      if (parsed) {
        // Fetch domain intel safely
        setIsLoadingDomain(true)
        fetch('/api/domain-intel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: parsed.domain })
        })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setDomainData(data)
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingDomain(false))
      }
    }
  }, [scan])

  if (!intel) return null // Only render if URL is present

  const getRiskColor = (level: string) => {
    if (level === 'CRITICAL') return 'text-threat-critical border-threat-critical bg-threat-critical/10'
    if (level === 'HIGH') return 'text-threat-high border-threat-high bg-threat-high/10'
    if (level === 'SUSPICIOUS') return 'text-amber-500 border-amber-500 bg-amber-500/10'
    return 'text-threat-low border-threat-low bg-threat-low/10'
  }

  // Deduce "Why Flagged" based on available signals
  const flagReasons: {title: string, desc: string, evidence: string}[] = []
  if (intel.hasSuspiciousKeywords) {
    flagReasons.push({ title: 'CREDENTIAL / IDENTITY SIGNAL', desc: 'The URL path contains keywords strongly associated with login, billing, or identity verification portals.', evidence: 'Keywords matched in URL structure.' })
  }
  if (scan.indicators.some(i => i.toLowerCase().includes('impersonation'))) {
    flagReasons.push({ title: 'IMPERSONATION SIGNAL', desc: 'The domain structure appears designed to visually resemble a trusted organization.', evidence: 'Brand extraction heuristic trigger.' })
  }
  if (intel.isLong || intel.isEncoded) {
    flagReasons.push({ title: 'OBFUSCATION SIGNAL', desc: 'The URL employs excessive length or encoding, often used to bypass basic filters or hide malicious parameters.', evidence: 'Structure analysis.' })
  }
  if (scan.threat_memory && scan.threat_memory.some(m => !m.is_new && m.entity_type === 'domain')) {
    flagReasons.push({ title: 'MEMORY SIGNAL', desc: 'SafeCore has previously investigated interactions connected to this exact domain.', evidence: 'Threat Memory match.' })
  }
  
  if (flagReasons.length === 0) {
    flagReasons.push({ title: 'NEUTRAL SIGNAL', desc: 'No obvious malicious indicators detected natively in the URL structure.', evidence: 'Structural scan clean.' })
  }

  const memoryHits = scan.threat_memory?.filter(m => !m.is_new) || []

  return (
    <div className="w-full flex flex-col gap-8 font-sans">
      
      {/* LAB HEADER */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-lg">
          <Globe className="w-5 h-5 text-cyber-cyan" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
            URL & DOMAIN INTELLIGENCE
          </h2>
          <p className="text-xs text-slate-400 mt-1">Specialized investigation lab for structural and network threat signals.</p>
        </div>
      </div>

      {/* RISK OVERVIEW HERO */}
      <GlassCard className="bg-[#0A0F1A] border-slate-800 flex flex-col md:flex-row p-6 md:p-8 gap-8">
        
        <div className="md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 block">ASSESSMENT</span>
          <div className={`text-3xl font-bold uppercase tracking-tight mb-3 ${getRiskColor(scan.risk_level).split(' ')[0]}`}>
            {scan.risk_level}
          </div>
          <div className="text-sm font-medium text-slate-300 bg-black/40 px-3 py-2 rounded border border-slate-800">
            {scan.scam_category !== 'Safe / Neutral' ? scan.scam_category : 'Standard URL'}
          </div>
        </div>

        <div className="md:w-2/3 flex flex-col justify-center">
          <h3 className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-cyber-cyan" /> WHY SAFECORE FLAGGED THIS
          </h3>
          <div className="space-y-4">
            {flagReasons.map((reason, i) => (
              <div key={i}>
                <h4 className="text-sm font-bold text-slate-200">{reason.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{reason.desc}</p>
                <span className="text-[9px] text-slate-500 font-mono mt-1 block px-2 py-0.5 bg-slate-900 border border-slate-800 rounded inline-block">
                  Evidence: {reason.evidence}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <button onClick={() => { playCyberClick(); document.getElementById('evidence-locker')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-[10px] text-cyber-cyan font-bold uppercase tracking-widest flex items-center gap-2 hover:text-cyan-300 transition-colors">
              <ExternalLink className="w-3 h-3" /> View in Evidence Locker
            </button>
          </div>
        </div>
      </GlassCard>

      {/* URL STRUCTURE */}
      <GlassCard className="bg-[#0A0F1A] border-slate-800 p-6">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-purple-400" /> URL STRUCTURE
        </h3>
        <div className="bg-[#05080F] border border-slate-800 rounded-lg p-4 font-mono text-sm break-all flex flex-wrap text-slate-400 leading-relaxed shadow-inner">
          <span className="text-slate-500">{intel.protocol}://</span>
          <span className="text-white font-bold">{intel.domain}</span>
          <span className="text-purple-400">{intel.path}</span>
          <span className="text-cyber-cyan">{intel.query}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/40 p-3 rounded border border-slate-800">
            <span className="block text-[9px] text-slate-500 uppercase tracking-widest mb-1">Normalized</span>
            <span className="text-xs text-slate-300 truncate block font-mono" title={intel.normalized}>{intel.normalized}</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-slate-800">
            <span className="block text-[9px] text-slate-500 uppercase tracking-widest mb-1">Registrable Domain</span>
            <span className="text-xs text-slate-300 font-bold font-mono">{intel.registrableDomain}</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-slate-800">
            <span className="block text-[9px] text-slate-500 uppercase tracking-widest mb-1">Encoding</span>
            <span className="text-xs font-bold text-slate-300">{intel.isEncoded ? 'Obfuscated' : 'Standard'}</span>
          </div>
          <div className="bg-black/40 p-3 rounded border border-slate-800">
            <span className="block text-[9px] text-slate-500 uppercase tracking-widest mb-1">Length Profile</span>
            <span className="text-xs font-bold text-slate-300">{intel.isLong ? 'Suspiciously Long' : 'Normal'}</span>
          </div>
        </div>
      </GlassCard>

      {/* DOMAIN PROFILE */}
      <GlassCard className="bg-[#0A0F1A] border-slate-800 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <Server className="w-4 h-4 text-cyber-cyan" /> DOMAIN PROFILE
          </h3>
          {domainData && <span className="text-[9px] text-slate-500 font-mono">Live DNS Lookup: Success</span>}
        </div>
        
        {isLoadingDomain ? (
          <div className="flex flex-col items-center justify-center p-8 text-slate-500">
            <div className="w-6 h-6 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin mb-3"></div>
            <span className="text-xs font-bold uppercase tracking-widest">Querying DNS Records...</span>
          </div>
        ) : domainData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">A Records (IP)</span>
                <span className="text-xs font-mono text-slate-200">
                  {domainData.ips && domainData.ips.length > 0 ? domainData.ips[0] : 'Hidden / Failed'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Mail Exchange (MX)</span>
                <span className="text-xs font-mono text-slate-200">
                  {domainData.hasMx ? 'Configured' : 'Missing'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">TXT Records (SPF/DMARC)</span>
                <span className="text-xs font-mono text-slate-200">
                  {domainData.hasTxt ? 'Detected' : 'Missing'}
                </span>
              </div>
            </div>

            <div className="bg-black/50 border border-slate-800 rounded-lg p-4 flex flex-col justify-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">INFRASTRUCTURE INTELLIGENCE</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                SafeCore performed a real-time DNS resolution on <span className="text-slate-200 font-mono">{intel.domain}</span>. 
                {domainData.ips && domainData.ips.length > 0 
                  ? ' Active routing IP identified.' 
                  : ' The domain appears unroutable or protected by an aggressive WAF.'}
                {!domainData.hasMx && ' Lack of MX records often indicates a throwaway domain not configured for legitimate corporate email.'}
              </p>
              <span className="text-[9px] text-cyber-cyan font-mono mt-3 block">Source: SafeCore Live Resolver</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-black/40 border border-slate-800 rounded-lg text-center">
            <span className="text-xs text-slate-500">External infrastructure intelligence currently unavailable.</span>
          </div>
        )}
      </GlassCard>

      {/* THREAT MEMORY & CONSTELLATION PREVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* MEMORY */}
        <GlassCard className="bg-[#0A0F1A] border-slate-800 p-6">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> THREAT MEMORY
          </h3>
          {memoryHits.length > 0 ? (
            <div>
              <div className="inline-block px-3 py-1 bg-threat-high/10 border border-threat-high/30 text-threat-high text-[10px] font-bold uppercase tracking-widest rounded mb-4">
                RECURRING DOMAIN
              </div>
              <p className="text-xs text-slate-400 mb-4">
                SafeCore has observed elements of this domain in previous investigations. Proceed with extreme caution.
              </p>
              <ul className="space-y-2 mb-4">
                {memoryHits.map((m, i) => (
                  <li key={i} className="flex justify-between items-center text-xs p-2 bg-black/40 border border-slate-800 rounded">
                    <span className="text-slate-300 font-mono truncate">{m.entity}</span>
                    <span className="text-slate-500 text-[10px] uppercase">MATCH</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-black/40 border border-slate-800 rounded-lg h-[150px]">
              <CheckCircle className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">NEW DOMAIN</span>
              <p className="text-[10px] text-slate-500 mt-1 text-center max-w-[200px]">This is the first time SafeCore has observed this domain.</p>
            </div>
          )}
        </GlassCard>

        {/* RELATED THREATS (CONSTELLATION) */}
        <GlassCard className="bg-[#0A0F1A] border-slate-800 p-6 flex flex-col">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyber-cyan" /> RELATED THREATS
          </h3>
          <div className="flex-1 flex flex-col justify-center items-center bg-black/40 border border-slate-800 rounded-lg p-6 relative overflow-hidden group min-h-[150px]">
            {/* Fake constellation drawing for visual impact */}
            <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 200 100">
                <line x1="50" y1="50" x2="150" y2="50" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="50" cy="50" r="4" fill="#06b6d4" />
                <circle cx="150" cy="50" r="6" fill="#ef4444" />
              </svg>
            </div>
            
            <span className="text-sm font-bold text-slate-200 z-10 mb-1">
              {scan.journey_nodes.length > 2 ? 'Potentially Connected' : 'No related threats mapped'}
            </span>
            <span className="text-[10px] text-slate-400 z-10 text-center max-w-[220px] mb-4">
              {scan.journey_nodes.length > 2 
                ? 'SafeCore traced this domain to other entities in the threat network.' 
                : 'No extended relationships identified in the Constellation matrix.'}
            </span>
            
            <Link href="/constellation" className="z-10 mt-auto">
              <button onClick={playCyberClick} className="text-[10px] bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan font-bold uppercase tracking-widest px-4 py-2 rounded hover:bg-cyber-cyan hover:text-black transition-colors flex items-center gap-2">
                Explore Constellation <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </GlassCard>

      </div>

      {/* WHAT SHOULD YOU DO? */}
      <GlassCard className="bg-[#0A0F1A] border-slate-800 p-6 md:p-8">
        <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> WHAT SHOULD YOU DO?
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          
          <div className="flex-1 bg-threat-critical/10 border border-threat-critical/30 rounded-xl p-5 hover:bg-threat-critical/20 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-threat-critical uppercase tracking-widest px-2 py-1 bg-threat-critical/20 rounded">PRIMARY ACTION</span>
            </div>
            <h4 className="text-lg font-bold text-slate-100 mb-2">Avoid this website</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Do not enter credentials, download files, or approve transactions on this domain. Close the tab immediately.
            </p>
            <button onClick={playCyberClick} className="w-full text-xs font-bold uppercase tracking-widest bg-threat-critical text-white py-3 rounded-lg hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              Understood
            </button>
          </div>

          <div className="flex-1 bg-black/40 border border-slate-800 rounded-xl p-5 hover:bg-slate-900/60 transition-colors flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-cyber-cyan uppercase tracking-widest px-2 py-1 bg-cyber-cyan/10 rounded border border-cyber-cyan/30">SECONDARY ACTION</span>
            </div>
            <h4 className="text-lg font-bold text-slate-100 mb-2">Verify through Official Source</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 flex-1">
              If this URL claims to be from a legitimate service (like a bank or delivery company), log in through their official, verified mobile app instead.
            </p>
            <div className="text-[10px] text-slate-500 font-mono bg-slate-900 border border-slate-800 rounded p-2 text-center">
              Never use links provided in urgent messages.
            </div>
          </div>

        </div>
      </GlassCard>


      {/* INFRASTRUCTURE LIMITATIONS */}
      <GlassCard className="bg-[#0A0F1A] border-slate-800 p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> ADVANCED INSPECTION STATUS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-black/40 border border-slate-800 rounded-lg">
            <span className="text-xs font-bold text-slate-300 block mb-1">Redirect Chain Analysis</span>
            <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Unavailable in Environment</span>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              SafeCore has suspended automated HTTP redirect tracing to strictly enforce SSRF (Server-Side Request Forgery) network safety policies.
            </p>
          </div>
          <div className="p-4 bg-black/40 border border-slate-800 rounded-lg">
            <span className="text-xs font-bold text-slate-300 block mb-1">Deep Website Inspection</span>
            <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Requires Headless Proxy</span>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              Dynamic DOM crawling and payload execution are disabled. SafeCore will not interact directly with the destination infrastructure.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
