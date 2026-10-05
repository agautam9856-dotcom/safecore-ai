import { ScanRecord } from '@/types/threat'
import { GlassCard } from '@/components/ui/glass-card'
import { ThreatBadge } from '@/components/ui/threat-badge'
import { TelemetryMeter } from '@/components/ui/telemetry-meter'
import { Radar, Target, AlertTriangle, ShieldCheck } from 'lucide-react'

export function ThreatAnalysisCard({ scan }: { scan: ScanRecord }) {
  const isHighRisk = scan.risk_level === 'HIGH' || scan.risk_level === 'CRITICAL'
  
  return (
    <GlassCard withCorners withGlow glowColor={isHighRisk ? 'red' : 'cyan'} className="flex flex-col gap-6">
      
      <div className="flex items-start justify-between border-b border-slate-800 pb-5">
        <div className="w-1/2">
          <TelemetryMeter value={scan.risk_score} showLabel />
        </div>
        <div className="flex flex-col items-end gap-2">
          <ThreatBadge level={scan.risk_level} className="scale-110 origin-right" />
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded border border-slate-800 uppercase tracking-widest mt-1">
            {scan.scam_category}
          </span>
        </div>
      </div>

      <div className={`p-6 rounded-xl border bg-opacity-10 backdrop-blur-md relative overflow-hidden ${isHighRisk ? 'border-threat-critical/80 bg-threat-critical/20 text-red-100 shadow-[0_0_25px_rgba(239,68,68,0.2)]' : 'border-threat-suspicious/80 bg-threat-suspicious/20 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]'}`}>
        {isHighRisk && <div className="absolute top-0 right-0 w-32 h-32 bg-threat-critical/20 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse pointer-events-none" />}
        <div className="flex items-center gap-3 mb-3 relative z-10">
          <Radar className={`w-6 h-6 ${isHighRisk ? 'text-threat-critical' : 'text-threat-suspicious'} animate-spin-slow`} style={{ animationDuration: '3s' }} />
          <span className={`text-xs font-bold tracking-[0.2em] uppercase ${isHighRisk ? 'text-threat-critical' : 'text-threat-suspicious'}`}>
            PREDICTIVE ALERT: SCAMMER&apos;S NEXT MOVE
          </span>
        </div>
        <p className="text-sm font-medium leading-relaxed tracking-wide relative z-10">{scan.predicted_next_step}</p>
      </div>

      <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 shadow-inner">
        <h3 className="text-xs font-bold text-cyber-cyan tracking-[0.2em] mb-5 flex items-center gap-2">
          <Target className="w-4 h-4" /> EXPLAINABLE AI MATRIX (3-POINT BREAKDOWN)
        </h3>
        
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">WHAT DETECTED:</span>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">{scan.scam_category} pattern match confirmed.</p>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">WHY FLAGGED (HEURISTICS):</span>
            <p className="text-sm text-slate-300 leading-relaxed mb-2">{scan.explanation}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {scan.indicators.map((ind, i) => (
                <span key={i} className="text-[10px] font-mono uppercase bg-black/50 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-amber-500" /> {ind}
                </span>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">WHAT NEXT (TACTICAL GUIDANCE):</span>
            <p className="text-sm text-threat-low leading-relaxed font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> See Action Center Protocol below to neutralize threat.
            </p>
          </div>
        </div>
      </div>

    </GlassCard>
  )
}
