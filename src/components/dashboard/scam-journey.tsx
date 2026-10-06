"use client"
import { JourneyNode } from '@/types/threat'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { playCyberClick } from '@/lib/audio'
import { Info, Phone, MessageSquare, Link2, Globe, ShieldAlert, CreditCard } from 'lucide-react'

const getIcon = (type: string) => {
  switch (type) {
    case 'phone': return <Phone className="w-4 h-4" />
    case 'sms': return <MessageSquare className="w-4 h-4" />
    case 'url': return <Link2 className="w-4 h-4" />
    case 'website': return <Globe className="w-4 h-4" />
    case 'payment': return <CreditCard className="w-4 h-4" />
    default: return <ShieldAlert className="w-4 h-4" />
  }
}

export function ScamJourney({ nodes }: { nodes: JourneyNode[] }) {
  const [selected, setSelected] = useState<JourneyNode | null>(null)

  if (!nodes || nodes.length === 0) return null

  return (
    <div className="relative w-full overflow-x-auto py-12 no-scrollbar font-sans">
      
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#0A0F1A] border border-cyber-border-highlight text-slate-100 p-5 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.15)] z-30 flex flex-col gap-3 min-w-[320px] backdrop-blur-xl"
          >
            <div className="flex justify-between items-center mb-1 border-b border-slate-800/80 pb-3">
              <span className="text-xs font-bold text-cyber-cyan tracking-tight">Entity Forensics</span>
              <button onClick={() => { playCyberClick(); setSelected(null); }} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-slate-500 font-medium">Value</div><div className="text-slate-200 font-semibold truncate" title={selected.label}>{selected.label}</div>
              <div className="text-slate-500 font-medium">Protocol</div><div className="text-slate-200 font-mono text-xs uppercase">{selected.type}</div>
              <div className="text-slate-500 font-medium">Risk Status</div><div className={selected.status === 'flagged' ? 'text-threat-critical font-bold' : 'text-amber-400 font-bold'}>{selected.status.toUpperCase()}</div>
              <div className="text-slate-500 font-medium">Known ASN</div><div className="text-slate-200">{selected.status === 'flagged' ? 'High-Risk Network' : 'Pending Verification'}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center min-w-max px-8 relative z-10">
        {nodes.map((node, i) => (
          <div key={node.id} className="flex items-center group relative">
            
            <motion.div 
              onClick={() => { playCyberClick(); setSelected(node); }}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15, type: 'spring', stiffness: 200, damping: 20 }}
              className={cn(
                "cursor-pointer relative flex flex-col items-center justify-center p-6 rounded-2xl border w-60 h-36 text-center backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl",
                node.status === 'flagged' ? 'border-threat-critical/50 bg-threat-critical/10 text-red-50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 
                node.status === 'warning' ? 'border-amber-500/50 bg-amber-500/10 text-amber-50 shadow-[0_0_20px_rgba(245,158,11,0.15)]' :
                'border-slate-800 bg-[#0A0F1A] text-slate-300 hover:border-slate-600'
              )}
            >
              {node.status === 'flagged' && (
                <div className="absolute -inset-px border border-threat-critical rounded-2xl animate-ping opacity-30 pointer-events-none" />
              )}

              <div className="flex items-center gap-2 mb-3">
                <div className={cn("p-2 rounded-lg bg-black/40", node.status === 'flagged' ? 'text-threat-critical' : node.status === 'warning' ? 'text-amber-500' : 'text-slate-400')}>
                  {getIcon(node.type)}
                </div>
                {node.status !== 'neutral' && <Info className="w-3 h-3 opacity-50"/>}
              </div>

              <span className="font-bold text-sm truncate w-full px-2 tracking-tight" title={node.label}>{node.label}</span>
              <span className="text-[10px] font-medium tracking-wide mt-auto opacity-90 bg-black/40 px-3 py-1.5 rounded-md w-full truncate border border-white/5">{node.details}</span>
            </motion.div>

            {i < nodes.length - 1 && (
              <motion.div 
                initial={{ width: 0 }} animate={{ width: 60 }} transition={{ delay: i * 0.15 + 0.1 }}
                className="relative h-0.5 bg-slate-800/80 overflow-hidden shrink-0 mx-4"
              >
                <motion.div 
                  className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-100 shadow-[0_0_10px_#06B6D4]"
                  animate={{ x: [-48, 60] }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
