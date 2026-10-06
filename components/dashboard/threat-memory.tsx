"use client"
import { ThreatMemoryContext, RiskLevel } from '@/types/threat'
import { motion } from 'framer-motion'
import { Database, Clock, History, AlertTriangle, CheckCircle, ExternalLink, Activity } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ThreatBadge } from '@/components/ui/threat-badge'
import { playCyberClick } from '@/lib/audio'

export function ThreatMemory({ memory }: { memory?: ThreatMemoryContext[] }) {
  const [selectedEntity, setSelectedEntity] = useState<ThreatMemoryContext | null>(null)

  if (!memory || memory.length === 0) return null

  // Sort memories: seen before first
  const sortedMemory = [...memory].sort((a, b) => {
    if (a.is_new === b.is_new) return b.observation_count - a.observation_count;
    return a.is_new ? 1 : -1;
  });

  return (
    <div className="w-full mt-2 font-sans">
      <div className="bg-[#0A0F1A]/80 border border-slate-800/80 rounded-2xl p-6 shadow-inner">
        <h3 className="text-sm font-bold text-slate-100 tracking-tight mb-5 flex items-center gap-2">
          <Database className="w-4 h-4 text-cyber-cyan" /> THREAT MEMORY DATABASE
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedMemory.map((mem, i) => (
            <motion.div 
              key={`${mem.entity}-${i}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-4 rounded-xl border backdrop-blur-md overflow-hidden ${mem.is_new ? 'border-slate-800/80 bg-black/20' : 'border-cyber-cyan/30 bg-cyber-cyan/10'}`}
            >
              {/* Background Glow for seen entities */}
              {!mem.is_new && <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />}
              
              <div className="relative z-10 flex flex-col gap-3">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">{mem.entity_type}</span>
                    <span className="text-sm font-semibold text-slate-200 break-all">{mem.entity}</span>
                  </div>
                  {mem.is_new ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-900/80 border border-slate-700 px-2 py-1 rounded-md uppercase tracking-wide">
                      <CheckCircle className="w-3 h-3 text-threat-low" /> New Entity
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 px-2 py-1 rounded-md uppercase tracking-wide">
                      <History className="w-3 h-3" /> {mem.observation_count > 1 ? 'Recurring' : 'Seen Before'}
                    </span>
                  )}
                </div>

                {/* Content */}
                {mem.is_new ? (
                  <p className="text-xs text-slate-400 mt-2">First time SafeCore has observed this entity. Added to Threat Memory.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide flex items-center gap-1"><Clock className="w-3 h-3"/> First Seen</span>
                        <span className="text-xs text-slate-300 font-mono">{new Date(mem.first_seen).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide flex items-center gap-1"><Activity className="w-3 h-3"/> Observations</span>
                        <span className="text-xs text-slate-300 font-mono">{mem.observation_count} occurrences</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-3 mt-1 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide mb-1">Previous Risk</span>
                        <div className="flex items-center gap-2">
                          <ThreatBadge level={mem.previous_risk as RiskLevel} className="scale-75 origin-left" />
                          <span className="text-[10px] text-slate-400 truncate max-w-[100px]" title={mem.previous_category}>{mem.previous_category}</span>
                        </div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger onClick={() => { playCyberClick(); setSelectedEntity(mem); }} className="text-[10px] font-bold text-cyber-cyan hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors bg-black/40 px-3 py-1.5 rounded border border-cyber-cyan/20 hover:border-cyber-cyan/50">
                          Inspect <ExternalLink className="w-3 h-3" />
                        </DialogTrigger>
                        
                        <DialogContent className="bg-cyber-obsidian border-slate-800/80 text-slate-200 sm:max-w-[500px] shadow-2xl rounded-2xl font-sans">
                          <DialogHeader>
                            <DialogTitle className="text-slate-100 font-bold tracking-tight flex items-center gap-2 border-b border-slate-800/80 pb-4">
                              <Database className="w-5 h-5 text-cyber-cyan" /> Memory Investigation
                            </DialogTitle>
                          </DialogHeader>
                          
                          {selectedEntity && (
                            <div className="space-y-5 py-2">
                              <div className="bg-[#0A0F1A] border border-slate-800 rounded-xl p-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">{selectedEntity.entity_type}</span>
                                <span className="text-lg font-bold text-slate-100 break-all">{selectedEntity.entity}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Observation Count</span>
                                  <span className="text-sm text-slate-200 font-mono">{selectedEntity.observation_count} total hits</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Time Profile</span>
                                  <span className="text-xs text-slate-300 block mb-0.5"><span className="text-slate-500">First:</span> {new Date(selectedEntity.first_seen).toLocaleDateString()}</span>
                                  <span className="text-xs text-slate-300 block"><span className="text-slate-500">Last:</span> {new Date(selectedEntity.last_seen).toLocaleDateString()}</span>
                                </div>
                                <div className="col-span-2 border-t border-slate-800/80 pt-4 mt-2">
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-2">Historical Threat Profile</span>
                                  <div className="flex items-center gap-3">
                                    <ThreatBadge level={selectedEntity.previous_risk as RiskLevel} />
                                    <span className="text-sm font-medium text-slate-300">{selectedEntity.previous_category}</span>
                                  </div>
                                </div>
                                <div className="col-span-2 border-t border-slate-800/80 pt-4 mt-2">
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-2">Related Infrastructure</span>
                                  <p className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-800/80">
                                    <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-500" /> SafeCore memory indicates this entity frequently correlates with {selectedEntity.previous_category.toLowerCase()} campaigns.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}
