import { ScanRecord } from '@/types/threat'
import { GlassCard } from '@/components/ui/glass-card'
import { ThreatBadge } from '@/components/ui/threat-badge'
import { TelemetryMeter } from '@/components/ui/telemetry-meter'
import { Radar, Target, AlertTriangle, ShieldCheck } from 'lucide-react'
import { ThreatDNA } from './threat-dna'
import { ThreatMemory } from './threat-memory'

export function ThreatAnalysisCard({ scan }: { scan: ScanRecord }) {
  const isHighRisk = scan.risk_level === 'HIGH' || scan.risk_level === 'CRITICAL'
  
  return (
    <GlassCard withCorners withGlow glowColor={isHighRisk ? 'red' : 'cyan'} className="flex flex-col gap-8 font-sans">
      
      <div className="flex flex-col md:flex-row items-start justify-between border-b border-slate-800/80 pb-6 gap-6">
        <div className="w-full md:w-1/2">
          <TelemetryMeter value={scan.risk_score} showLabel />
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
          <ThreatBadge level={scan.risk_level} className="scale-110 origin-left md:origin-right" />
          <span className="text-[11px] font-mono text-slate-400 bg-[#0A0F1A] px-3 py-1.5 rounded-md border border-slate-800 uppercase tracking-widest mt-1">
            {scan.scam_category.toUpperCase().replace(/\s+/g, '_')}
          </span>
        </div>
      </div>

      <ThreatDNA scan={scan} />

      <ThreatMemory memory={scan.threat_memory} />

      <div className={`p-6 rounded-2xl border backdrop-blur-xl relative overflow-hidden ${isHighRisk ? 'border-threat-critical/50 bg-threat-critical/10 text-red-50 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-amber-500/50 bg-amber-500/10 text-amber-50 shadow-[0_0_20px_rgba(245,158,11,0.1)]'}`}>
        {isHighRisk && <div className="absolute top-0 right-0 w-48 h-48 bg-threat-critical/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse pointer-events-none" />}
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <Radar className={`w-6 h-6 ${isHighRisk ? 'text-threat-critical' : 'text-amber-500'} animate-spin-slow`} style={{ animationDuration: '4s' }} />
          <span className={`text-xs font-bold tracking-[0.15em] uppercase ${isHighRisk ? 'text-threat-critical' : 'text-amber-500'}`}>
            PREDICTIVE ALERT: SCAMMER&apos;S NEXT MOVE
          </span>
        </div>
        <p className="text-base md:text-lg font-medium leading-relaxed tracking-tight relative z-10">{scan.predicted_next_step}</p>
      </div>

      <div className="bg-[#0A0F1A]/80 p-6 rounded-2xl border border-slate-800/80 shadow-inner">
        <h3 className="text-sm font-bold text-slate-100 tracking-tight mb-6 flex items-center gap-2">
          <Target className="w-4 h-4 text-cyber-cyan" /> EXPLAINABLE AI MATRIX
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">What Detected:</span>
            <p className="text-sm md:text-base text-slate-200 font-medium">{scan.scam_category} pattern match confirmed.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Why Flagged:</span>
            <p className="text-sm md:text-base text-slate-200 font-medium mb-2">{scan.explanation}</p>
            <div className="flex flex-wrap gap-2">
              {scan.indicators.map((ind, i) => (
                <span key={i} className="text-[11px] font-medium bg-black/40 text-amber-100/90 border border-slate-700/80 px-3 py-1.5 rounded-md flex items-center gap-2 tracking-wide">
                  <AlertTriangle className="w-3 h-3 text-amber-500" /> {ind}
                </span>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">What Next:</span>
            <p className="text-sm md:text-base text-threat-low font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Consult Action Center Protocol below to neutralize threat.
            </p>
          </div>
        </div>
      </div>

    </GlassCard>
  )
}
