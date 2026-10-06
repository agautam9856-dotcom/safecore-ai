"use client"
import { ScanRecord, JourneyNode, NextMovePrediction } from '@/types/threat'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { PlayCircle, ShieldAlert, Phone, MessageSquare, Link2, Globe, CreditCard, Lock, ChevronRight, CheckCircle, Crosshair, HelpCircle, Activity, Info } from 'lucide-react'
import { playCyberClick, playCyberScan, playCyberComplete } from '@/lib/audio'

const getIcon = (type: string) => {
  switch (type) {
    case 'phone': return <Phone className="w-5 h-5" />
    case 'sms': return <MessageSquare className="w-5 h-5" />
    case 'url': return <Link2 className="w-5 h-5" />
    case 'website': return <Globe className="w-5 h-5" />
    case 'payment': return <CreditCard className="w-5 h-5" />
    case 'otp': return <Lock className="w-5 h-5" />
    default: return <ShieldAlert className="w-5 h-5" />
  }
}

export function AttackPathReplay({ scan }: { scan: ScanRecord }) {
  const [replayIdx, setReplayIdx] = useState<number>(-1)
  const [revealFuture, setRevealFuture] = useState(false)
  const [selectedNode, setSelectedNode] = useState<JourneyNode | null>(null)

  // Initialization: if we are not replaying, show all observed immediately, but hide future until revealed
  const isHighRisk = scan.risk_level === 'HIGH' || scan.risk_level === 'CRITICAL'
  const hasPredictions = scan.next_moves && scan.next_moves.length > 0
  
  const handleReplay = () => {
    playCyberClick()
    setRevealFuture(false)
    setSelectedNode(null)
    setReplayIdx(0)
    let idx = 0
    const limit = scan.journey_nodes.filter(n => n.stage !== 'PREDICTED').length
    
    const interval = setInterval(() => {
      playCyberClick()
      idx++
      setReplayIdx(idx)
      if (idx >= limit) {
        clearInterval(interval)
        playCyberComplete()
        setReplayIdx(-1) // finished replaying
      }
    }, 800)
  }

  const handleRevealFuture = () => {
    playCyberScan()
    setRevealFuture(true)
    setTimeout(() => playCyberComplete(), 600)
  }

  const isVisible = (node: JourneyNode, index: number) => {
    if (replayIdx !== -1) {
      return index <= replayIdx
    }
    if (node.stage === 'PREDICTED' && !revealFuture) return false
    return true
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 font-sans">
      
      {/* LEFT COLUMN: THE PATH */}
      <div className="flex-1 bg-[#0A0F1A] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-inner">
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h3 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyber-cyan" /> ATTACK PATH REPLAY
          </h3>
          <button 
            onClick={handleReplay} 
            disabled={replayIdx !== -1}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border border-slate-700 hover:border-cyber-cyan/50 bg-black/40 hover:bg-cyber-cyan/10 rounded transition-colors disabled:opacity-50"
          >
            <PlayCircle className="w-3 h-3 text-cyber-cyan" /> {replayIdx !== -1 ? 'Replaying...' : 'Replay Path'}
          </button>
        </div>

        <div className="relative pl-6 md:pl-10 space-y-8 z-10">
          {/* Vertical Line */}
          <div className="absolute left-9 md:left-[52px] top-4 bottom-4 w-px bg-slate-800/80">
             {revealFuture && (
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-cyan/30 to-transparent animate-pulse" />
             )}
          </div>

          {scan.journey_nodes.map((node, i) => {
            const visible = isVisible(node, i)
            const isObserved = node.stage === 'OBSERVED' || node.stage === 'CURRENT'
            const isCurrent = node.stage === 'CURRENT'
            const isPredicted = node.stage === 'PREDICTED'
            const isSelected = selectedNode?.id === node.id

            return (
              <AnimatePresence key={node.id}>
                {visible && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                  >
                    {/* The Node Content */}
                    <div 
                      onClick={() => { playCyberClick(); setSelectedNode(isSelected ? null : node); }}
                      className={`relative flex items-center gap-4 group cursor-pointer transition-transform ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
                    >
                      {/* Node Icon Circle */}
                      <div className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full border-2 transition-colors ${
                        isPredicted ? 'border-dashed border-slate-600 bg-[#0A0F1A] text-slate-500' :
                        isCurrent ? 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan shadow-[0_0_15px_rgba(6,182,212,0.3)]' :
                        'border-slate-500 bg-slate-900 text-slate-300'
                      }`}>
                        {isCurrent && <div className="absolute inset-0 rounded-full animate-ping bg-cyber-cyan/20 pointer-events-none" />}
                        {getIcon(node.type)}
                      </div>

                      {/* Node Body */}
                      <div className={`flex-1 border rounded-xl p-3 transition-colors ${
                        isSelected ? 'border-cyber-cyan/50 bg-cyber-cyan/5' :
                        isPredicted ? 'border-dashed border-slate-800 bg-transparent' :
                        'border-slate-800/80 bg-black/40 hover:bg-slate-900'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[9px] font-bold uppercase tracking-widest ${isPredicted ? 'text-slate-500' : isCurrent ? 'text-cyber-cyan' : 'text-slate-400'}`}>
                                {node.stage}
                              </span>
                              {node.status === 'flagged' && <span className="text-[9px] bg-threat-critical/20 text-threat-critical px-1.5 rounded uppercase tracking-wide">Threat</span>}
                            </div>
                            <span className={`font-bold text-sm ${isPredicted ? 'text-slate-400' : 'text-slate-200'}`}>{node.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* YOU ARE HERE Marker */}
                    {isCurrent && replayIdx === -1 && !revealFuture && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 ml-14 mb-4"
                      >
                        <div className="border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-md inline-flex items-center gap-2 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                          <Crosshair className="w-4 h-4 animate-pulse" /> YOU ARE HERE
                        </div>
                      </motion.div>
                    )}

                    {/* Reveal Next Move Button */}
                    {isCurrent && replayIdx === -1 && !revealFuture && isHighRisk && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 ml-14 relative z-20">
                        <button 
                          onClick={handleRevealFuture}
                          className="flex items-center gap-2 bg-threat-high/10 hover:bg-threat-high/20 border border-threat-high/50 text-threat-high text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(249,115,22,0.15)] hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] group"
                        >
                          <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" /> Reveal Possible Next Step
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: INSPECTOR & NEXT MOVE AI */}
      <div className="w-full md:w-[350px] flex flex-col gap-6">
        
        {/* Stage Inspector */}
        <div className="bg-[#0A0F1A] border border-slate-800/80 rounded-2xl p-5 shadow-inner flex-1 min-h-[300px]">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Info className="w-4 h-4 text-cyber-cyan" /> STAGE INSPECTOR
          </h3>
          
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div key={selectedNode.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Active Stage</span>
                  <span className="text-sm font-bold text-slate-200">{selectedNode.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Type</span>
                    <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded border border-slate-800 text-slate-300 uppercase">{selectedNode.type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Status</span>
                    <span className={`text-xs font-bold uppercase tracking-wide ${selectedNode.stage === 'PREDICTED' ? 'text-slate-500' : selectedNode.status === 'flagged' ? 'text-threat-critical' : 'text-amber-500'}`}>{selectedNode.stage}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">What Happened</span>
                  <p className="text-xs text-slate-300 bg-black/40 p-3 rounded border border-slate-800/80 leading-relaxed">{selectedNode.details || 'System mapped this trajectory based on core archetypes.'}</p>
                </div>
                {selectedNode.evidence && selectedNode.evidence.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-2">Supporting Evidence</span>
                    {selectedNode.evidence.map((ev, i) => (
                      <div key={i} className="text-xs font-mono text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800 truncate mb-1" title={ev}>
                        {ev}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 opacity-60">
                <Crosshair className="w-8 h-8" />
                <span className="text-xs font-bold uppercase tracking-widest text-center">Select any node on the left to inspect forensics</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* NEXT MOVE AI PREDICTION */}
        <AnimatePresence>
          {revealFuture && hasPredictions && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }}
              className="bg-threat-high/10 border border-threat-high/50 rounded-2xl p-5 shadow-[0_0_20px_rgba(249,115,22,0.1)] overflow-hidden"
            >
              <h3 className="text-[10px] font-bold text-threat-high uppercase tracking-widest mb-3 flex items-center gap-2">
                <ShieldAlert className="w-3 h-3 animate-pulse" /> NEXT MOVE AI FORECAST
              </h3>

              {scan.next_moves?.map((pred, idx) => (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-white">{pred.type}</span>
                    <span className="text-[10px] bg-threat-high/20 text-threat-high px-2 py-0.5 rounded font-bold uppercase tracking-wide border border-threat-high/30">
                      {pred.confidence}% LIKELY
                    </span>
                  </div>
                  
                  <div className="bg-black/40 rounded-lg p-3 border border-threat-high/20 mb-3">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Why did AI predict this?</span>
                    <ul className="space-y-1">
                      {pred.why.map((reason, i) => (
                        <li key={i} className="text-[10px] text-slate-300 flex items-start gap-1.5 leading-tight">
                          <CheckCircle className="w-3 h-3 text-threat-high shrink-0 mt-0.5" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="w-full bg-threat-critical text-white text-[11px] font-bold uppercase tracking-widest py-2.5 rounded hover:bg-red-600 transition-colors">
                    {pred.action_label}
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Prediction Fallback */}
        <AnimatePresence>
          {revealFuture && !hasPredictions && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-5">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">NEXT MOVE AI</h3>
              <p className="text-xs text-slate-300">Not enough evidence to make a reliable forward prediction. Verify the sender independently before proceeding.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
