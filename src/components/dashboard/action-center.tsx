"use client"
import { ScanRecord } from '@/types/threat'
import { CheckCircle, XCircle, ShieldOff, Megaphone, ShieldAlert, FileText, Download } from 'lucide-react'
import { reportCommunityThreat } from '@/lib/threat-service'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playCyberClick } from '@/lib/audio'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function ActionCenter({ scan }: { scan: ScanRecord }) {
  const [reported, setReported] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  const handleReport = async () => {
    if (reported) return
    playCyberClick()
    try {
      const entityVal = scan.journey_nodes.find(n => n.type === 'phone' || n.type === 'url')?.label || 'Unknown'
      await reportCommunityThreat({
        entity_type: scan.journey_nodes.find(n => n.type === 'phone') ? 'phone' : 'url',
        entity_value: entityVal,
        threat_type: scan.scam_category
      })
      setReported(true)
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 4500)
    } catch (e) {
      console.error(e)
    }
  }

  const actions = [
    { id: 'verify', icon: CheckCircle, title: 'VERIFY', color: 'text-threat-low', bg: 'bg-threat-low/10', border: 'border-threat-low/30', text: scan.actions.verify },
    { id: 'avoid', icon: XCircle, title: 'AVOID', color: 'text-threat-critical', bg: 'bg-threat-critical/10', border: 'border-threat-critical/30', text: scan.actions.avoid },
    { id: 'block', icon: ShieldOff, title: 'BLOCK', color: 'text-threat-suspicious', bg: 'bg-threat-suspicious/10', border: 'border-threat-suspicious/30', text: scan.actions.block },
  ]

  return (
    <div className="relative">
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 right-10 bg-[#0A101C] border-2 border-cyber-cyan text-cyber-cyan px-6 py-5 rounded-xl shadow-[0_0_40px_rgba(6,182,212,0.6)] z-50 flex items-center gap-4"
          >
            <ShieldAlert className="w-8 h-8 animate-pulse" />
            <span className="font-mono text-sm tracking-widest font-bold uppercase">Threat Node Synchronized Across 24,600+ Defense Terminals!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {actions.map(a => (
          <div key={a.id} onClick={playCyberClick} className={`cursor-pointer p-6 rounded-2xl border backdrop-blur-md ${a.bg} ${a.border} flex flex-col gap-3 shadow-lg hover:-translate-y-1 transition-transform`}>
            <div className="flex items-center gap-2">
              <a.icon className={`w-5 h-5 ${a.color}`} />
              <span className={`text-[11px] font-bold tracking-[0.15em] ${a.color}`}>{a.title}</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">{a.text}</p>
          </div>
        ))}
        
        {/* Report Button */}
        <div 
          onClick={handleReport}
          className={`p-6 rounded-2xl border backdrop-blur-md flex flex-col gap-3 transition-all shadow-lg ${
            reported 
              ? 'bg-threat-low/10 border-threat-low/50 cursor-default' 
              : 'bg-cyber-cyan/10 border-cyber-cyan/40 hover:bg-cyber-cyan/20 cursor-pointer hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:-translate-y-1'
          }`}
        >
          <div className="flex items-center gap-2">
            <Megaphone className={`w-5 h-5 ${reported ? 'text-threat-low' : 'text-cyber-cyan'}`} />
            <span className={`text-[11px] font-bold tracking-[0.15em] ${reported ? 'text-threat-low' : 'text-cyber-cyan'}`}>
              {reported ? 'REPORTED TO NETWORK' : 'REPORT TO COMMUNITY'}
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            {reported ? 'This threat has been synced with the global SafeCore database.' : scan.actions.report}
          </p>
        </div>
      </div>

      {/* Forensic Dossier Export */}
      <Dialog>
        <DialogTrigger onClick={playCyberClick} className="mt-5 w-full p-4 rounded-xl border border-cyber-border-highlight bg-slate-900/50 hover:bg-slate-800/80 cursor-pointer flex items-center justify-center gap-3 transition-all shadow-inner group">
          <Download className="w-4 h-4 text-cyber-cyan group-hover:animate-bounce" />
          <span className="text-xs font-bold text-cyber-cyan tracking-[0.2em] uppercase">Export Forensic Dossier</span>
        </DialogTrigger>
        <DialogContent className="bg-cyber-obsidian border-cyber-border-highlight text-slate-200 sm:max-w-[700px] shadow-[0_0_50px_rgba(6,182,212,0.15)] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-cyber-cyan tracking-widest uppercase flex items-center gap-2 border-b border-slate-800 pb-4">
              <FileText className="w-5 h-5" /> SafeCore Forensic Incident Briefing
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 block mb-1">INCIDENT REF:</span>
                <span className="text-slate-200 font-bold">{scan.id.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">UTC TIMESTAMP:</span>
                <span className="text-slate-200 font-bold">{new Date(scan.created_at).toUTCString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">COMPOSITE RISK INDEX:</span>
                <span className={`font-bold text-lg ${scan.risk_level === 'CRITICAL' || scan.risk_level === 'HIGH' ? 'text-threat-critical' : 'text-amber-500'}`}>{scan.risk_score} / 100 ({scan.risk_level})</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">THREAT CATEGORY:</span>
                <span className="text-slate-200 font-bold bg-slate-800 px-2 py-1 rounded">{scan.scam_category}</span>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-4">
              <span className="text-slate-500 block mb-2">RAW INTERCEPT PAYLOAD:</span>
              <p className="p-3 bg-black/50 border border-slate-800 rounded text-slate-400 break-all">{scan.raw_payload}</p>
            </div>
            <div className="border-t border-slate-800 pt-4">
              <span className="text-slate-500 block mb-2">EXTRACTED THREAT INDICATORS:</span>
              <ul className="list-disc pl-5 space-y-1 text-amber-400/80">
                {scan.indicators.map((ind, i) => <li key={i}>{ind}</li>)}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
