"use client"
import { useEffect, useState } from 'react'
import { getCommunityIntelligence, getRecentScans } from '@/lib/threat-service'
import type { CommunityReport, ScanRecord } from '@/types/threat'
import { GlassCard } from '@/components/ui/glass-card'
import { ThreatBadge } from '@/components/ui/threat-badge'
import { Activity, Globe, Database, CheckCircle2 } from 'lucide-react'

export function IntelFeed() {
  const [intel, setIntel] = useState<CommunityReport[]>([])
  const [recent, setRecent] = useState<ScanRecord[]>([])

  useEffect(() => {
    getCommunityIntelligence(8).then(setIntel).catch(console.error)
    getRecentScans(6).then(setRecent).catch(console.error)
  }, [])

  return (
    <div className="flex flex-col gap-6 h-full">
      <GlassCard className="flex-1">
        <h3 className="text-[11px] font-bold text-cyber-cyan tracking-widest mb-5 flex items-center gap-2 uppercase">
          <Globe className="w-4 h-4 animate-pulse" /> Community Threat Radar
        </h3>
        <div className="space-y-3">
          {intel.map((report, idx) => (
            <div key={report.id} className="group flex justify-between items-center p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-600 transition-all hover:bg-slate-800/80">
              <div className="truncate pr-4 flex items-start gap-2">
                <span className="text-[10px] text-slate-600 font-mono pt-0.5">{(idx+1).toString().padStart(2, '0')}</span>
                <div>
                  <p className="text-xs font-mono text-slate-200 truncate group-hover:text-cyber-cyan transition-colors" title={report.entity_value}>{report.entity_value}</p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 mt-1 truncate flex items-center gap-1">
                    {report.verified_status && <CheckCircle2 className="w-3 h-3 text-threat-low" />}
                    {report.threat_type}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] font-bold text-threat-suspicious bg-threat-suspicious/10 px-2 py-1 rounded-sm border border-threat-suspicious/20">{report.reports_count} FLAGS</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="flex-1">
        <h3 className="text-[11px] font-bold text-cyber-cyan tracking-widest mb-5 flex items-center gap-2 uppercase">
          <Database className="w-4 h-4" /> Live Audit Log
        </h3>
        <div className="space-y-3">
          {recent.map(r => (
            <div key={r.id} className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-bold tracking-wider uppercase text-slate-300 truncate pr-2">{r.scam_category}</p>
                <ThreatBadge level={r.risk_level} className="scale-90 origin-top-right shadow-none" />
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[9px] text-slate-500 font-mono bg-black/40 px-2 py-0.5 rounded">
                  {r.scan_type.toUpperCase()} VECTOR
                </p>
                <p className="text-[9px] text-slate-500 font-mono tracking-widest">
                  {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
