"use client"
import { useEffect, useState } from 'react'
import { getCommunityIntelligence, getRecentScans } from '@/lib/threat-service'
import type { CommunityReport, ScanRecord } from '@/types/threat'
import { GlassCard } from '@/components/ui/glass-card'
import { ThreatBadge } from '@/components/ui/threat-badge'
import { Globe, Database, CheckCircle2 } from 'lucide-react'

export function IntelFeed() {
  const [intel, setIntel] = useState<CommunityReport[]>([])
  const [recent, setRecent] = useState<ScanRecord[]>([])

  const fetchData = () => {
    getCommunityIntelligence(8).then(setIntel).catch(() => {})
    getRecentScans(6).then(setRecent).catch(() => {})
  }

  useEffect(() => {
    fetchData()
    const handleUpdate = () => fetchData()
    window.addEventListener('threats-updated', handleUpdate)
    return () => window.removeEventListener('threats-updated', handleUpdate)
  }, [])

  return (
    <div className="flex flex-col gap-6 h-full font-sans">
      <GlassCard className="flex-1 bg-[#0A0F1A]/80 border-slate-800/80">
        <h3 className="text-sm font-bold text-slate-100 tracking-tight mb-5 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyber-cyan" /> Community Threat Radar
        </h3>
        <div className="space-y-3">
          {intel.map((report, idx) => (
            <div key={report.id} className="group flex justify-between items-center p-3 rounded-xl bg-black/20 border border-slate-800/50 hover:border-slate-700 transition-all hover:bg-black/40">
              <div className="truncate pr-4 flex items-start gap-3">
                <span className="text-[10px] text-slate-600 font-mono font-medium pt-0.5">{(idx+1).toString().padStart(2, '0')}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-cyber-cyan transition-colors" title={report.entity_value}>{report.entity_value}</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate flex items-center gap-1">
                    {report.verified_status && <CheckCircle2 className="w-3 h-3 text-threat-low" />}
                    {report.threat_type}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">{report.reports_count} FLAGS</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="flex-1 bg-[#0A0F1A]/80 border-slate-800/80">
        <h3 className="text-sm font-bold text-slate-100 tracking-tight mb-5 flex items-center gap-2">
          <Database className="w-4 h-4 text-cyber-cyan" /> Live Audit Log
        </h3>
        <div className="space-y-3">
          {recent.map(r => (
            <div key={r.id} className="flex flex-col gap-2 p-3.5 rounded-xl bg-black/20 border border-slate-800/50 hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start">
                <p className="text-xs font-semibold text-slate-300 truncate pr-2">{r.journey_nodes[0]?.type === 'terminal' || !r.journey_nodes[0]?.evidence?.length ? 'Payload: ' + (r.raw_payload.substring(0, 30) + '...') : r.scam_category}</p>
                <ThreatBadge level={r.risk_level} className="scale-90 origin-top-right shadow-none" />
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[10px] text-slate-400 font-medium bg-black/40 px-2 py-0.5 rounded-md uppercase tracking-wide">
                  {r.scan_type} VECTOR
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
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
