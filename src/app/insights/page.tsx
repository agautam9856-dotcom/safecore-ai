"use client"
import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/header'
import { GlassCard } from '@/components/ui/glass-card'
import { getRecentScans } from '@/lib/threat-service'
import { generateInsights } from '@/lib/insights-engine'
import { SecurityInsights } from '@/types/insights'
import { ScanRecord } from '@/types/threat'
import { ShieldAlert, CheckCircle, TrendingUp, TrendingDown, Minus, Activity, Clock, Target, Eye, Database, Brain, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { playCyberClick } from '@/lib/audio'

export default function InsightsPage() {
  // const [scans, setScans] = useState<ScanRecord[]>([])
  const [insights, setInsights] = useState<SecurityInsights | null>(null)

  useEffect(() => {
    async function load() {
      const data = await getRecentScans()
      // setScans(data)
      const computed = generateInsights(data)
      setInsights(computed)
    }
    load()
  }, [])

  const getTrendIcon = (dir: string) => {
    if (dir === 'INCREASING') return <TrendingUp className="w-8 h-8 text-threat-critical" />
    if (dir === 'IMPROVING') return <TrendingDown className="w-8 h-8 text-cyber-cyan" />
    if (dir === 'STABLE') return <Minus className="w-8 h-8 text-slate-400" />
    return <Activity className="w-8 h-8 text-slate-600" />
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'THREAT_DETECTED': return <ShieldAlert className="w-4 h-4 text-threat-high" />
      case 'SAFE_ACTIVITY': return <CheckCircle className="w-4 h-4 text-threat-low" />
      case 'MEMORY_RECURRENCE': return <Database className="w-4 h-4 text-amber-500" />
      case 'CONSTELLATION_MAPPED': return <Activity className="w-4 h-4 text-purple-500" />
      case 'PREDICTION_GENERATED': return <Brain className="w-4 h-4 text-cyber-cyan" />
      case 'ACTION_REQUIRED': return <Target className="w-4 h-4 text-threat-critical" />
      default: return <Eye className="w-4 h-4 text-slate-400" />
    }
  }

  const getSeverityColor = (sev: string) => {
    if (sev === 'CRITICAL') return 'border-threat-critical text-threat-critical bg-threat-critical/10'
    if (sev === 'HIGH') return 'border-threat-high text-threat-high bg-threat-high/10'
    if (sev === 'SUSPICIOUS') return 'border-amber-500 text-amber-500 bg-amber-500/10'
    return 'border-threat-low text-threat-low bg-threat-low/10'
  }

  return (
    <div className="min-h-screen bg-[#030509] text-slate-200 font-sans selection:bg-cyber-cyan/30">
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* HEADER */}
        <div className="mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 uppercase tracking-widest flex items-center gap-3">
              <Activity className="w-6 h-6 text-cyber-cyan" />
              SECURITY INSIGHTS & RISK TIMELINE
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Time-series analysis of your digital threat exposure based on derived SafeCore investigations.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">ANALYSIS PERIOD</span>
            <span className="text-xs font-mono text-slate-300 bg-black/40 px-3 py-1.5 rounded border border-slate-800">
              ALL TIME HISTORY
            </span>
          </div>
        </div>

        {!insights ? (
          <div className="flex justify-center items-center h-64 text-slate-500">
            <div className="animate-spin w-8 h-8 border-2 border-cyber-cyan border-t-transparent rounded-full mr-3"></div>
            PROCESSING SECURITY INTELLIGENCE...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COL: TREND HERO & STATS */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              <GlassCard className="bg-[#0A0F1A] border-slate-800 p-6">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-4">CURRENT SECURITY TREND</span>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
                  <div className="p-4 bg-black/40 rounded-xl border border-slate-800">
                    {getTrendIcon(insights.trend.direction)}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold uppercase tracking-tight ${
                      insights.trend.direction === 'INCREASING' ? 'text-threat-critical' : 
                      insights.trend.direction === 'IMPROVING' ? 'text-cyber-cyan' : 'text-slate-200'
                    }`}>
                      {insights.trend.direction.replace('_', ' ')}
                    </h2>
                    <span className="text-[10px] text-slate-400">vs Previous Period</span>
                  </div>
                </div>
                
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {insights.trend.description}
                </p>

                {insights.trend.primaryDriver && (
                  <div className="bg-slate-900/50 border border-slate-800 rounded p-3">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">PRIMARY DRIVER</span>
                    <span className="text-xs font-bold text-slate-200">{insights.trend.primaryDriver}</span>
                  </div>
                )}
                
                {insights.trend.direction === 'INSUFFICIENT_DATA' && (
                  <div className="bg-black/50 border border-slate-800 rounded p-3 text-center">
                    <span className="text-xs text-slate-500">Not enough historical data yet.</span>
                  </div>
                )}
              </GlassCard>

              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="bg-[#0A0F1A] border-slate-800 p-4">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">RECURRING THREATS</span>
                  <div className="text-2xl font-mono text-amber-500 font-bold">{insights.recurringThreats}</div>
                  <span className="text-[9px] text-slate-400 block mt-1">Memory matches</span>
                </GlassCard>
                <GlassCard className="bg-[#0A0F1A] border-slate-800 p-4">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">TOP CATEGORY</span>
                  <div className="text-sm font-bold text-slate-200 truncate" title={insights.topCategory || 'N/A'}>{insights.topCategory || 'None'}</div>
                  <span className="text-[9px] text-slate-400 block mt-1">Most frequent</span>
                </GlassCard>
              </div>

              <div className="bg-black/20 border border-slate-800/50 rounded-xl p-6 text-center">
                <Link href="/">
                  <button onClick={playCyberClick} className="text-xs font-bold uppercase tracking-widest bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 px-6 py-3 rounded hover:bg-cyber-cyan hover:text-black transition-colors w-full flex items-center justify-center gap-2">
                    <ArrowRight className="w-4 h-4" /> Back to Dashboard
                  </button>
                </Link>
              </div>

            </div>

            {/* RIGHT COL: RISK TIMELINE */}
            <div className="lg:col-span-8">
              <GlassCard className="bg-[#0A0F1A] border-slate-800 p-6 md:p-8 h-full">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                  <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyber-cyan" /> RISK TIMELINE
                  </h2>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {insights.totalEvents} EVENTS RECORDED
                  </span>
                </div>

                <div className="relative border-l border-slate-800 ml-4 space-y-8 pb-8">
                  {insights.timeline.length === 0 ? (
                    <div className="pl-8 text-sm text-slate-500">No events recorded.</div>
                  ) : (
                    insights.timeline.map((evt) => (
                      <div key={evt.id} className="relative pl-8 group">
                        {/* Timeline Node */}
                        <div className={`absolute -left-[17px] top-1 p-2 rounded-full border bg-[#0A0F1A] ${getSeverityColor(evt.severity)} transition-transform group-hover:scale-110 z-10`}>
                          {getEventIcon(evt.type)}
                        </div>
                        
                        {/* Event Content */}
                        <div className="bg-black/30 border border-slate-800/60 rounded-xl p-5 group-hover:border-slate-700 transition-colors">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                            <div>
                              <h3 className="text-sm font-bold text-slate-100">{evt.title}</h3>
                              <span className="text-[10px] text-slate-500 font-mono block mt-1">
                                {new Date(evt.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="shrink-0">
                              <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded border ${getSeverityColor(evt.severity)}`}>
                                {evt.severity}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed mt-3">
                            {evt.description}
                          </p>
                          {evt.entity && (
                            <div className="mt-3 inline-block bg-slate-900 border border-slate-800 rounded px-3 py-1.5">
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest mr-2">Entity:</span>
                              <span className="text-xs font-mono text-slate-300">{evt.entity}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  
                  {/* Timeline terminator */}
                  <div className="absolute -left-1 bottom-0 w-2 h-2 rounded-full bg-slate-800" />
                </div>
              </GlassCard>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
