"use client"
import { JourneyNode } from '@/types/threat'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { playCyberClick } from '@/lib/audio'
import { Info } from 'lucide-react'

export function ScamJourney({ nodes }: { nodes: JourneyNode[] }) {
  const [selected, setSelected] = useState<JourneyNode | null>(null)

  if (!nodes || nodes.length === 0) return null

  return (
    <div className="relative w-full overflow-x-auto py-12 no-scrollbar">
      
      {/* Node Inspector Popover */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 border border-cyber-cyan text-white p-4 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] z-30 flex flex-col gap-2 min-w-[300px]"
          >
            <div className="flex justify-between items-center mb-1 border-b border-slate-700 pb-2">
              <span className="text-[10px] font-bold text-cyber-cyan tracking-widest uppercase">Forensic Telemetry Inspector</span>
              <button onClick={() => { playCyberClick(); setSelected(null); }} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="text-slate-500">Entity Value:</div><div className="text-slate-200 truncate" title={selected.label}>{selected.label}</div>
              <div className="text-slate-500">Protocol:</div><div className="text-slate-200 uppercase">{selected.type}</div>
              <div className="text-slate-500">Risk Status:</div><div className={selected.status === 'flagged' ? 'text-threat-critical' : 'text-amber-400'}>{selected.status.toUpperCase()}</div>
              <div className="text-slate-500">Known Malicious:</div><div className="text-slate-200">{selected.status === 'flagged' ? 'TRUE (Verified)' : 'Pending Scan'}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center min-w-max px-8 relative z-10">
        {nodes.map((node, i) => (
          <div key={node.id} className="flex items-center group relative">
            
            {/* Node */}
            <motion.div 
              onClick={() => { playCyberClick(); setSelected(node); }}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.2 }}
              className={cn(
                "cursor-pointer relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 w-56 h-32 text-center bg-opacity-40 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl",
                node.status === 'flagged' ? 'border-threat-critical/80 bg-threat-critical/20 text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 
                node.status === 'warning' ? 'border-threat-suspicious/80 bg-threat-suspicious/20 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]' :
                'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
              )}
            >
              {/* Pulse Ring for Flagged */}
              {node.status === 'flagged' && (
                <div className="absolute -inset-2 border-2 border-threat-critical rounded-2xl animate-ping opacity-20 pointer-events-none" />
              )}

              <span className="text-[11px] font-mono uppercase opacity-70 mb-3 tracking-widest flex items-center gap-2">
                {node.type} {node.status !== 'neutral' && <Info className="w-3 h-3"/>}
              </span>
              <span className="font-bold text-sm truncate w-full px-2" title={node.label}>{node.label}</span>
              <span className="text-[9px] uppercase mt-auto font-medium tracking-widest opacity-80 bg-black/60 px-3 py-1.5 rounded-full w-full truncate border border-white/10">{node.details}</span>
            </motion.div>

            {/* Connector Pipeline */}
            {i < nodes.length - 1 && (
              <motion.div 
                initial={{ width: 0 }} animate={{ width: 80 }} transition={{ delay: i * 0.2 + 0.1 }}
                className="relative h-1.5 bg-slate-800 overflow-hidden shrink-0 mx-3 rounded-full"
              >
                <motion.div 
                  className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-transparent via-cyber-neon to-transparent opacity-90 shadow-[0_0_10px_#38BDF8]"
                  animate={{ x: [-64, 80] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
