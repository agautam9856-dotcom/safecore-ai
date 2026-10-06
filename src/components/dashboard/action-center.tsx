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
      window.dispatchEvent(new Event('threats-updated'))
      setTimeout(() => setToastVisible(false), 4500)
    } catch {
      // Silently catch network errors
    }
  }

  const actions = [
    { id: 'verify', icon: CheckCircle, title: 'VERIFY', color: 'text-threat-low', bg: 'bg-threat-low/10', border: 'border-threat-low/30', text: scan.actions.verify },
    { id: 'avoid', icon: XCircle, title: 'AVOID', color: 'text-threat-critical', bg: 'bg-threat-critical/10', border: 'border-threat-critical/30', text: scan.actions.avoid },
    { id: 'block', icon: ShieldOff, title: 'BLOCK', color: 'text-threat-suspicious', bg: 'bg-threat-suspicious/10', border: 'border-threat-suspicious/30', text: scan.actions.block },
  ]

  return (
    <div className="relative font-sans">
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 bg-[#070B14] border border-threat-low text-threat-low px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] z-50 flex items-center gap-3 backdrop-blur-xl"
          >
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide">Threat Node Synchronized Across 24,600+ Defense Terminals!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map(a => (
          <div key={a.id} onClick={playCyberClick} className={`cursor-pointer p-6 rounded-2xl border backdrop-blur-md ${a.bg} ${a.border} flex flex-col gap-3 hover:-translate-y-1 transition-all shadow-sm`}>
            <div className="flex items-center gap-2">
              <a.icon className={`w-5 h-5 ${a.color}`} />
              <span className={`text-[11px] font-bold tracking-[0.1em] uppercase ${a.color}`}>{a.title}</span>
            </div>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">{a.text}</p>
          </div>
        ))}
        
        {/* Report Button */}
        <div 
          onClick={handleReport}
          className={`p-6 rounded-2xl border backdrop-blur-md flex flex-col gap-3 transition-all ${
            reported 
              ? 'bg-threat-low/10 border-threat-low/40 cursor-default shadow-none' 
              : 'bg-cyber-cyan/10 border-cyber-cyan/40 hover:bg-cyber-cyan/20 cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:-translate-y-1'
          }`}
        >
          <div className="flex items-center gap-2">
            <Megaphone className={`w-5 h-5 ${reported ? 'text-threat-low' : 'text-cyber-cyan'}`} />
            <span className={`text-[11px] font-bold tracking-[0.1em] uppercase ${reported ? 'text-threat-low' : 'text-cyber-cyan'}`}>
              {reported ? 'REPORTED TO NETWORK' : 'REPORT TO COMMUNITY'}
            </span>
          </div>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            {reported ? 'This threat has been synced with the global SafeCore database.' : scan.actions.report}
          </p>
        </div>
      </div>

      <Dialog>
        <DialogTrigger onClick={playCyberClick} className="mt-5 w-full p-4 rounded-xl border border-slate-700/80 bg-[#0A0F1A] hover:bg-slate-800/80 cursor-pointer flex items-center justify-center gap-2 transition-all shadow-sm group">
          <Download className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
          <span className="text-xs font-bold text-slate-300 group-hover:text-white tracking-wide uppercase transition-colors">Export Forensic Dossier</span>
        </DialogTrigger>
        <DialogContent className="bg-cyber-obsidian border-slate-800/80 text-slate-200 sm:max-w-[700px] shadow-2xl rounded-2xl font-sans">
          <DialogHeader>
            <DialogTitle className="text-slate-100 font-bold tracking-tight text-lg flex items-center gap-2 border-b border-slate-800/80 pb-4">
              <FileText className="w-5 h-5 text-cyber-cyan" /> SafeCore Forensic Incident Briefing
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0A0F1A] p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 font-medium text-xs block mb-1">INCIDENT REF</span>
                <span className="text-slate-200 font-mono text-xs">{scan.id.toUpperCase()}</span>
              </div>
              <div className="bg-[#0A0F1A] p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 font-medium text-xs block mb-1">UTC TIMESTAMP</span>
                <span className="text-slate-200 font-mono text-xs">{new Date(scan.created_at).toUTCString()}</span>
              </div>
              <div className="bg-[#0A0F1A] p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 font-medium text-xs block mb-1">ORIGIN CONTACT</span>
                <span className="text-slate-200 font-mono text-xs">{scan.journey_nodes[0]?.type === 'terminal' || !scan.journey_nodes[0]?.evidence?.length ? 'Not Provided (Direct Message Body)' : scan.journey_nodes[0]?.label}</span>
              </div>
              <div className="bg-[#0A0F1A] p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 font-medium text-xs block mb-1">COMPOSITE RISK INDEX</span>
                <span className={`font-bold ${scan.risk_level === 'CRITICAL' || scan.risk_level === 'HIGH' ? 'text-threat-critical' : 'text-amber-500'}`}>{scan.risk_score} / 100 ({scan.risk_level})</span>
              </div>
              <div className="bg-[#0A0F1A] p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 font-medium text-xs block mb-1">THREAT CATEGORY</span>
                <span className="text-slate-200 font-semibold">{scan.scam_category}</span>
              </div>
            </div>
            <div className="border-t border-slate-800/80 pt-4">
              <span className="text-slate-500 font-medium text-xs block mb-2">RAW INTERCEPT PAYLOAD</span>
              <p className="p-3 bg-black/40 border border-slate-800/80 rounded-lg text-slate-400 font-mono text-xs break-all leading-relaxed">{scan.raw_payload}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
