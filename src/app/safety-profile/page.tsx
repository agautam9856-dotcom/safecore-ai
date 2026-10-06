"use client"
import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/header'
import { GlassCard } from '@/components/ui/glass-card'
import { getRecentScans } from '@/lib/threat-service'
import { generateAlerts } from '@/lib/alert-engine'
import { generateSafetyProfile } from '@/lib/profile-engine'
import { SafetyProfile } from '@/types/profile'
import { ScanRecord } from '@/types/threat'
import { motion } from 'framer-motion'
import { playCyberClick } from '@/lib/audio'
import { ShieldCheck, Activity, AlertTriangle, Fingerprint, Network, ChevronRight, HelpCircle, Eye, ShieldAlert, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import Link from 'next/link'

export default function SafetyProfilePage() {
  const [profile, setProfile] = useState<SafetyProfile | null>(null)
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const recentScans = await getRecentScans()
      const alerts = generateAlerts(recentScans)
      const prof = generateSafetyProfile(recentScans, alerts)
      setScans(recentScans)
      setProfile(prof)
      setIsLoading(false)
    }
    load()
  }, [])

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-[#070B14] text-slate-200 font-sans cyber-grid selection:bg-cyber-cyan/30">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 text-slate-700 mb-4" />
            <div className="text-sm font-bold text-slate-500 tracking-widest uppercase">Compiling Safety Intelligence...</div>
          </div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex flex-col bg-[#070B14] text-slate-200 font-sans cyber-grid selection:bg-cyber-cyan/30">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <GlassCard className="max-w-md w-full bg-[#0A0F1A] border-slate-800 text-center p-12">
            <ShieldCheck className="w-16 h-16 text-slate-600 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-100 mb-4 tracking-tight">YOUR SAFETY PROFILE IS READY</h1>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              SafeCore will build your personal safety profile as you analyze suspicious messages, phone numbers, URLs, and emails.
            </p>
            <Link href="/">
              <button onClick={playCyberClick} className="bg-cyber-cyan text-[#0A0F1A] font-bold text-sm uppercase tracking-widest px-8 py-3 rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                Analyze Something
              </button>
            </Link>
          </GlassCard>
        </div>
      </main>
    )
  }

  const getExposureColor = (level: string) => {
    if (level === 'CRITICAL') return 'text-threat-critical border-threat-critical shadow-[0_0_30px_rgba(239,68,68,0.3)]'
    if (level === 'HIGH EXPOSURE') return 'text-threat-high border-threat-high shadow-[0_0_30px_rgba(249,115,22,0.3)]'
    if (level === 'ELEVATED EXPOSURE') return 'text-amber-500 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
    return 'text-cyber-cyan border-cyber-cyan shadow-[0_0_30px_rgba(6,182,212,0.2)]'
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#070B14] text-slate-200 font-sans cyber-grid selection:bg-cyber-cyan/30 overflow-x-hidden">
      <Header />

      <div className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-8 flex flex-col gap-8 pb-20">
        
        {/* HEADER */}
        <div className="mb-2 mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-cyber-cyan" /> DIGITAL SAFETY HEALTH
            </h1>
            <p className="text-sm text-slate-400 mt-1">Based on your actual SafeCore activity.</p>
          </div>
          <span className="text-[10px] text-slate-500 font-mono hidden md:block">
            LAST UPDATED: {new Date(profile.lastUpdated).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COL: Hero & Stats */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* HERO CARD */}
            <GlassCard className={`relative overflow-hidden bg-[#0A0F1A] border-t-4 p-8 flex flex-col md:flex-row items-center gap-10 ${getExposureColor(profile.protectionLevel).replace('text', 'border')}`}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldAlert className="w-48 h-48" />
              </div>
              
              {/* Circular Indicator */}
              <div className="relative z-10 shrink-0">
                <div className={`w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm ${getExposureColor(profile.protectionLevel)}`}>
                  <span className="text-4xl font-bold font-mono tracking-tighter">{profile.exposureIndex}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-80">Exposure Index</span>
                </div>
              </div>

              <div className="relative z-10 flex-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">YOUR SAFETY STATUS</span>
                <h2 className={`text-2xl font-bold tracking-tight mb-4 uppercase ${getExposureColor(profile.protectionLevel).split(' ')[0]}`}>
                  {profile.protectionLevel}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-md">
                  Your recent activity shows {profile.protectionLevel === 'LOW EXPOSURE' ? 'normal activity with minimal risk signals' : `elevated exposure to threats. ${profile.mostCommonThreat ? `Primary vector involves ${profile.mostCommonThreat.name.toLowerCase()} attempts.` : ''}`}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-black/40 border border-slate-800 px-4 py-2 rounded-lg">
                    {profile.riskTrend.direction === 'INCREASING' ? <ArrowUpRight className="w-4 h-4 text-threat-high" /> : profile.riskTrend.direction === 'DECREASING' ? <ArrowDownRight className="w-4 h-4 text-cyber-cyan" /> : <Minus className="w-4 h-4 text-slate-500" />}
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase tracking-widest">Risk Trend</span>
                      <span className="text-xs font-bold text-slate-200">{profile.riskTrend.direction}</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* SNAPSHOT METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Recent Threats', value: profile.stats.totalInvestigations },
                { label: 'High-Risk', value: profile.stats.highRiskInvestigations, color: 'text-threat-critical' },
                { label: 'Recurring', value: profile.stats.recurringThreats, color: 'text-amber-500' },
                { label: 'Connected', value: profile.stats.connectedClusters, color: 'text-purple-400' }
              ].map((stat, i) => (
                <GlassCard key={i} className="bg-[#0A0F1A]/80 border-slate-800/80 p-5 flex flex-col items-center text-center">
                  <span className={`text-3xl font-mono font-bold mb-2 ${stat.color || 'text-slate-100'}`}>{stat.value}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{stat.label}</span>
                </GlassCard>
              ))}
            </div>

            {/* THREAT EXPOSURE BARS */}
            <GlassCard className="bg-[#0A0F1A] border-slate-800/80 p-6 md:p-8">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyber-cyan" /> YOUR THREAT EXPOSURE
              </h3>
              <div className="space-y-5">
                {profile.threatExposure.map((exposure, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-bold text-slate-300">{exposure.category}</span>
                      <span className="text-slate-500 font-mono">{exposure.count} incidents ({exposure.percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${exposure.percentage}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-cyber-cyan/50 to-cyber-cyan rounded-full"
                      />
                    </div>
                  </div>
                ))}
                {profile.threatExposure.length === 0 && (
                  <div className="text-sm text-slate-500 italic">No specific threat categories mapped yet.</div>
                )}
              </div>
            </GlassCard>

          </div>

          {/* RIGHT COL: Actions, Patterns, Insights */}
          <div className="flex flex-col gap-8">
            
            {/* WHAT YOU SHOULD DO */}
            <GlassCard className="bg-[#0A0F1A] border-slate-800/80 p-6">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> WHAT YOU SHOULD DO
              </h3>
              {profile.recommendations.length === 0 ? (
                <div className="text-xs text-slate-400 p-4 bg-black/40 rounded-lg border border-slate-800">No immediate actions required based on recent activity.</div>
              ) : (
                <div className="space-y-4">
                  {profile.recommendations.map((rec, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-800 bg-black/40 hover:bg-slate-900/80 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${rec.type === 'AVOID' ? 'bg-threat-critical/20 text-threat-critical' : 'bg-cyber-cyan/10 text-cyber-cyan'}`}>
                          {rec.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 mb-1">{rec.title}</h4>
                      <p className="text-xs text-slate-400 mb-3">{rec.description}</p>
                      <Link href="/">
                        <button className="text-xs font-bold text-cyber-cyan flex items-center gap-1 hover:text-cyan-300 transition-colors">
                          {rec.actionLabel} <ChevronRight className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* WHAT CHANGED */}
            <GlassCard className="bg-[#0A0F1A] border-slate-800/80 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-cyber-cyan/10 transition-colors" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4">WHAT CHANGED?</h3>
              <div className="mb-2">
                <span className={`text-lg font-bold ${profile.riskTrend.direction === 'INCREASING' ? 'text-threat-high' : profile.riskTrend.direction === 'DECREASING' ? 'text-cyber-cyan' : 'text-slate-300'}`}>
                  {profile.riskTrend.direction === 'INCREASING' ? 'Risk activity increased' : profile.riskTrend.direction === 'DECREASING' ? 'Exposure decreased' : 'No significant change'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {profile.riskTrend.description}
              </p>
              <div className="bg-black/50 p-3 rounded border border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest">
                Trend derived from chronological risk comparison of your investigation history.
              </div>
            </GlassCard>

            {/* RECURRING THREATS */}
            <GlassCard className="bg-[#0A0F1A] border-slate-800/80 p-6">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-purple-400" /> RECURRING ENTITIES
              </h3>
              {profile.recurringEntities.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No entities have been seen repeatedly.</div>
              ) : (
                <div className="space-y-3">
                  {profile.recurringEntities.map((ent, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-black/40 border border-slate-800 rounded-lg">
                      <div className="flex flex-col overflow-hidden pr-4">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">{ent.type}</span>
                        <span className="text-xs font-mono text-slate-300 truncate">{ent.entity}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-sm font-bold text-amber-500">{ent.count}</span>
                        <span className="block text-[9px] text-slate-500 uppercase">Times</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
            
          </div>
        </div>

        {/* BOTTOM ROW: Threat Constellation / Network Preview */}
        <div className="mt-4">
          <GlassCard className="bg-[#0A0F1A] border-slate-800/80 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Network className="w-4 h-4 text-cyber-cyan" /> YOUR THREAT NETWORK
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                SafeCore has mapped the underlying infrastructure between your {profile.stats.totalInvestigations} investigations, revealing {profile.stats.connectedClusters} hidden connections.
              </p>
            </div>
            <Link href="/constellation">
              <button onClick={playCyberClick} className="shrink-0 flex items-center gap-2 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                Explore Threat Network <ArrowRightIcon className="w-4 h-4" />
              </button>
            </Link>
          </GlassCard>
        </div>

      </div>
    </main>
  )
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14"></path>
      <path d="M12 5l7 7-7 7"></path>
    </svg>
  )
}
