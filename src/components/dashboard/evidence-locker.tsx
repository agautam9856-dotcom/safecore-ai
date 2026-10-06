"use client"
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanRecord } from '@/types/threat'
import { EvidenceItem } from '@/types/evidence'
import { extractEvidence } from '@/lib/evidence-extractor'
import { GlassCard } from '@/components/ui/glass-card'
import { Database, Search, Filter, ShieldAlert, Link2, MessageSquare, Phone, Activity, ArrowRight, Eye, PlayCircle, Fingerprint, Crosshair, HelpCircle, Lock } from 'lucide-react'
import { playCyberClick, playCyberScan, playCyberComplete } from '@/lib/audio'

export function EvidenceLocker({ scan }: { scan: ScanRecord }) {
  const allEvidence = useMemo(() => extractEvidence(scan), [scan])
  
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('ALL')
  const [selected, setSelected] = useState<EvidenceItem | null>(null)
  
  const [isTracing, setIsTracing] = useState(false)
  const [traceStep, setTraceStep] = useState(0)

  const filteredEvidence = useMemo(() => {
    return allEvidence.filter(e => {
      if (filter !== 'ALL' && e.type !== filter) return false
      if (search) {
        const q = search.toLowerCase()
        return e.content.toLowerCase().includes(q) || e.title.toLowerCase().includes(q) || e.type.toLowerCase().includes(q)
      }
      return true
    })
  }, [allEvidence, search, filter])

  const stats = useMemo(() => ({
    total: allEvidence.length,
    signals: allEvidence.filter(e => e.type === 'SIGNAL').length,
    entities: allEvidence.filter(e => e.type === 'URL' || e.type === 'PHONE' || e.type === 'DOMAIN').length,
    stages: new Set(allEvidence.map(e => e.relationships.attackPathStage).filter(Boolean)).size
  }), [allEvidence])

  const handleTrace = () => {
    playCyberClick()
    setIsTracing(true)
    setTraceStep(0)
    
    let step = 0
    playCyberScan()
    const interval = setInterval(() => {
      step++
      setTraceStep(step)
      if (step > 6) {
        clearInterval(interval)
        playCyberComplete()
      }
    }, 1000)
  }

  const getIcon = (type: string) => {
    switch(type) {
      case 'MESSAGE': return <MessageSquare className="w-4 h-4" />
      case 'PHONE': return <Phone className="w-4 h-4" />
      case 'URL': case 'DOMAIN': return <Link2 className="w-4 h-4" />
      case 'SIGNAL': return <Activity className="w-4 h-4" />
      default: return <ShieldAlert className="w-4 h-4" />
    }
  }

  const scrollToSection = (id: string) => {
    playCyberClick()
    // Minimal mock scroll behavior, in a real app we'd assign IDs to the sections
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <GlassCard className="bg-[#070B14]/90 border-slate-800/80 mt-8 flex flex-col font-sans relative overflow-hidden z-10" id="evidence-locker">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800/80 pb-6 mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <Lock className="w-5 h-5 text-cyber-cyan" /> EVIDENCE LOCKER
          </h2>
          <p className="text-xs text-slate-400 mt-1">Everything SafeCore used to understand this investigation.</p>
        </div>
        <div className="flex items-center gap-4 bg-black/40 border border-slate-800 rounded-lg p-3">
          <div className="flex flex-col items-center px-3 border-r border-slate-700/80">
            <span className="text-lg font-mono font-bold text-slate-200">{stats.total}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Items</span>
          </div>
          <div className="flex flex-col items-center px-3 border-r border-slate-700/80">
            <span className="text-lg font-mono font-bold text-slate-200">{stats.signals}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Signals</span>
          </div>
          <div className="flex flex-col items-center px-3">
            <span className="text-lg font-mono font-bold text-slate-200">{stats.entities}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Entities</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
        
        {/* Left: Filter, Search, List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 border-r border-slate-800/80 pr-0 lg:pr-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search evidence, URLs, signals..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyber-cyan/50 transition-colors"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['ALL', 'MESSAGE', 'URL', 'PHONE', 'SIGNAL'].map(f => (
              <button 
                key={f} 
                onClick={() => { playCyberClick(); setFilter(f); }}
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-colors border ${filter === f ? 'bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan' : 'bg-black/30 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
            {filteredEvidence.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-70">
                <Filter className="w-8 h-8 mb-3" />
                <span className="text-sm">No matching evidence found.</span>
              </div>
            ) : (
              filteredEvidence.map((ev, i) => (
                <div 
                  key={ev.id} 
                  onClick={() => { playCyberClick(); setSelected(ev); setIsTracing(false); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selected?.id === ev.id ? 'bg-cyber-cyan/5 border-cyber-cyan/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-[#0A0F1A] border-slate-800 hover:border-slate-600'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`p-1.5 rounded bg-black/40 ${selected?.id === ev.id ? 'text-cyber-cyan' : 'text-slate-400'}`}>
                      {getIcon(ev.type)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{ev.type}</span>
                    <span className="ml-auto text-[10px] text-slate-600 font-mono">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <h4 className={`text-sm font-bold mb-1 truncate ${selected?.id === ev.id ? 'text-slate-100' : 'text-slate-300'}`}>{ev.title}</h4>
                  <p className="text-xs text-slate-500 font-mono truncate">{ev.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Inspector & Graph */}
        <div className="w-full lg:w-2/3 flex flex-col relative">
          
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                
                {/* Meta Inspector */}
                <div className="bg-black/30 border border-slate-800 rounded-xl p-5 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">SELECTED EVIDENCE</span>
                      <h3 className="text-lg font-bold text-slate-100">{selected.title}</h3>
                    </div>
                    <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-3 py-1.5 rounded uppercase tracking-wide">
                      {selected.source}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-lg font-mono text-sm text-slate-300 break-all max-h-[150px] overflow-y-auto custom-scrollbar">
                    {selected.content}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">WHY DOES THIS MATTER?</span>
                      <p className="text-xs text-slate-300">
                        This {selected.type.toLowerCase()} contains signals associated with <span className="font-bold text-cyber-cyan">{selected.relationships.threatDna || 'suspicious activity'}</span> and is connected to the <span className="font-bold text-amber-500">{selected.relationships.attackPathStage || 'analysis'}</span> stage.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Evidence Graph / Trace The Threat */}
                <div className="flex-1 bg-[#0A0F1A] border border-slate-800/80 rounded-xl p-6 relative overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-6 z-20 relative">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Network className="w-4 h-4 text-cyber-cyan" /> EVIDENCE GRAPH
                    </h3>
                    <button 
                      onClick={handleTrace}
                      disabled={isTracing}
                      className="flex items-center gap-2 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 px-4 py-2 rounded text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      <PlayCircle className="w-4 h-4" /> ✦ TRACE THE THREAT
                    </button>
                  </div>

                  {/* Trace Flow */}
                  <div className="flex-1 flex flex-col justify-center relative z-10 px-4">
                    
                    {/* Vertical Connecting Line Background */}
                    <div className="absolute left-[39px] top-4 bottom-4 w-px bg-slate-800/80 -z-10" />

                    <TraceNode step={1} currentStep={traceStep} icon={<Database />} label="EVIDENCE" value={selected.title} activeColor="text-white" activeBorder="border-slate-500" />
                    
                    {selected.relationships.signal ? (
                      <TraceNode step={2} currentStep={traceStep} icon={<Activity />} label="SIGNAL DERIVED" value={selected.relationships.signal} activeColor="text-amber-500" activeBorder="border-amber-500" />
                    ) : <TraceSkip step={2} currentStep={traceStep} />}

                    {selected.relationships.threatDna ? (
                      <TraceNode step={3} currentStep={traceStep} icon={<Fingerprint />} label="THREAT DNA" value={selected.relationships.threatDna} activeColor="text-threat-critical" activeBorder="border-threat-critical" />
                    ) : <TraceSkip step={3} currentStep={traceStep} />}

                    {selected.relationships.attackPathStage ? (
                      <TraceNode step={4} currentStep={traceStep} icon={<Crosshair />} label="ATTACK PATH" value={selected.relationships.attackPathStage} activeColor="text-purple-500" activeBorder="border-purple-500" />
                    ) : <TraceSkip step={4} currentStep={traceStep} />}

                    {selected.relationships.nextMovePrediction ? (
                      <TraceNode step={5} currentStep={traceStep} icon={<HelpCircle />} label="NEXT MOVE AI" value={`Possible ${selected.relationships.nextMovePrediction}`} activeColor="text-threat-high" activeBorder="border-threat-high" />
                    ) : <TraceSkip step={5} currentStep={traceStep} />}

                    {selected.relationships.protectionAction ? (
                      <TraceNode step={6} currentStep={traceStep} icon={<ShieldAlert />} label="PROTECTION" value={selected.relationships.protectionAction} activeColor="text-cyber-cyan" activeBorder="border-cyber-cyan" />
                    ) : <TraceSkip step={6} currentStep={traceStep} />}

                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-60 bg-[#0A0F1A] border border-slate-800/80 rounded-2xl">
                <Database className="w-12 h-12" />
                <h3 className="text-lg font-bold tracking-tight">Select Evidence to Inspect</h3>
                <p className="text-sm max-w-sm text-center">Click any item on the left to reveal the signals, Threat DNA, and attack vectors derived from it.</p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </GlassCard>
  )
}

function TraceNode({ step, currentStep, icon, label, value, activeColor, activeBorder }: { step: number; currentStep: number; icon: React.ReactNode; label: string; value: string; activeColor: string; activeBorder: string }) {
  const isActive = currentStep >= step
  const isTarget = currentStep === step

  return (
    <div className={`flex items-start gap-6 mb-8 relative transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-20'}`}>
      <div className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center bg-[#070B14] z-10 transition-colors duration-500 ${isActive ? `${activeBorder} ${activeColor} shadow-[0_0_15px_currentColor]` : 'border-slate-800 text-slate-600'}`}>
        {isTarget && <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-20 pointer-events-none" />}
        <div className="scale-75">{icon}</div>
      </div>
      <div className="pt-1.5 flex-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{label}</span>
        <span className={`text-sm font-bold transition-colors duration-500 ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>{value}</span>
      </div>
    </div>
  )
}

function TraceSkip({ step, currentStep }: { step: number; currentStep: number }) {
  const isActive = currentStep >= step
  if (!isActive) return <div className="h-16 opacity-0" />
  return (
    <div className="flex items-center gap-6 mb-8 opacity-40">
      <div className="w-12 h-12 flex items-center justify-center z-10 bg-[#070B14]">
        <div className="w-2 h-2 rounded-full bg-slate-700" />
      </div>
      <span className="text-xs text-slate-600 font-mono italic">No relationship established</span>
    </div>
  )
}

function Network(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="16" y="16" width="6" height="6" rx="1"></rect>
      <rect x="2" y="16" width="6" height="6" rx="1"></rect>
      <rect x="9" y="2" width="6" height="6" rx="1"></rect>
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"></path>
      <path d="M12 12V8"></path>
    </svg>
  )
}
