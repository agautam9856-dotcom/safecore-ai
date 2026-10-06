"use client"
import { useState, useEffect } from 'react'
import { getRecentScans } from '@/lib/threat-service'
import { generateSafetyProfile } from '@/lib/profile-engine'
import { generateInsights } from '@/lib/insights-engine'
import { SafetyProfile } from '@/types/profile'
import { SecurityInsights } from '@/types/insights'
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import Link from 'next/link'
import { playCyberClick } from '@/lib/audio'

export function CommandCenterHero() {
  const [profile, setProfile] = useState<SafetyProfile | null>(null)
  const [insights, setInsights] = useState<SecurityInsights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const scans = await getRecentScans()
      const p = generateSafetyProfile(scans, [])
      const i = generateInsights(scans)
      setProfile(p)
      setInsights(i)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center text-slate-500 font-mono text-xs">
        INITIALIZING SECURE CONTEXT...
      </div>
    )
  }

  // Determine global state
  let stateLabel = 'GUARDED'
  let stateColor = 'text-cyber-cyan border-cyber-cyan bg-cyber-cyan/10'
  let Icon = ShieldCheck

  if (profile && profile.exposureIndex > 70) {
    stateLabel = 'CRITICAL ATTENTION'
    stateColor = 'text-threat-critical border-threat-critical bg-threat-critical/10'
    Icon = ShieldAlert
  } else if (profile && profile.exposureIndex > 40) {
    stateLabel = 'ELEVATED'
    stateColor = 'text-amber-500 border-amber-500 bg-amber-500/10'
    Icon = AlertTriangle
  } else if (!profile || profile.stats.totalInvestigations === 0) {
    stateLabel = 'LOW CONCERN'
    stateColor = 'text-threat-low border-threat-low bg-threat-low/10'
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <GlassCard className="flex-1 bg-[#0A0F1A] border-slate-800 p-6 flex flex-col md:flex-row items-center gap-6">
        <div className={`p-4 rounded-full border ${stateColor}`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">YOUR DIGITAL SAFETY</span>
          <h2 className={`text-2xl font-bold uppercase tracking-tight ${stateColor.split(' ')[0]}`}>
            {stateLabel}
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {insights?.trend.direction === 'INCREASING' ? 'Your threat exposure has increased recently.' : 
             insights?.trend.direction === 'IMPROVING' ? 'Your threat exposure is decreasing.' : 
             'No significant threat escalation detected.'}
          </p>
          {insights?.trend.primaryDriver && (
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mt-2 bg-black/40 inline-block px-2 py-1 rounded border border-slate-800">
              Primary driver: {insights.trend.primaryDriver}
            </span>
          )}
        </div>
      </GlassCard>

      <div className="flex-1 grid grid-cols-2 gap-4">
        <GlassCard className="bg-[#0A0F1A] border-slate-800 p-5 flex flex-col justify-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">ACTIVE THREATS</span>
          <div className="text-2xl font-bold text-slate-200">{profile?.stats.highRiskInvestigations || 0}</div>
          <Link href="/insights">
            <button onClick={playCyberClick} className="text-[9px] text-purple-400 uppercase tracking-widest mt-2 hover:underline">View Timeline &rarr;</button>
          </Link>
        </GlassCard>
        
        <GlassCard className="bg-[#0A0F1A] border-slate-800 p-5 flex flex-col justify-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">CONNECTED CLUSTERS</span>
          <div className="text-2xl font-bold text-slate-200">{profile?.stats.connectedClusters || 0}</div>
          <Link href="/constellation">
            <button onClick={playCyberClick} className="text-[9px] text-cyber-cyan uppercase tracking-widest mt-2 hover:underline">View Constellation &rarr;</button>
          </Link>
        </GlassCard>
      </div>
    </div>
  )
}
