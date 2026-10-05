"use client"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScanType } from '@/types/threat'
import { Search, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playCyberClick, playCyberScan } from '@/lib/audio'

interface ThreatScannerProps {
  onAnalyze: (payload: string, type: ScanType) => void
  isScanning: boolean
}

const PRESETS = [
  { id: 'sbi', label: '🔴 SIMULATE: SBI KYC LOCK BREACH', payload: 'SBI ALERT: Your NetBanking account is suspended due to expired KYC. Verify your identity immediately at https://sbi-kyc-portal.cc/login to prevent permanent blockage.', border: 'border-red-500/50 hover:bg-red-900/30 text-red-300' },
  { id: 'telegram', label: '🟠 SIMULATE: TELEGRAM ₹5,000/DAY TASK TRAP', payload: 'Congratulations! You have been selected for part-time YouTube rating tasks earning Rs 5,000/day. Contact HR on Telegram: https://t.me/job_recruiter_2026.', border: 'border-orange-500/50 hover:bg-orange-900/30 text-orange-300' },
  { id: 'post', label: '🟡 SIMULATE: INDIA POST FAILED DELIVERY', payload: 'India Post: Your package is held at depot due to an unpaid shipping fee of Rs 3.99. Pay here to release: bit.ly/indpost-fee', border: 'border-yellow-500/50 hover:bg-yellow-900/30 text-yellow-300' }
]

export function ThreatScanner({ onAnalyze, isScanning }: ThreatScannerProps) {
  const [payload, setPayload] = useState('')
  const [type, setType] = useState<ScanType>('message')
  const [loadingText, setLoadingText] = useState('DISSECTING SOCIAL-ENGINEERING HEURISTICS & SENDER SPOOFING...')

  useEffect(() => {
    if (!isScanning) return
    playCyberScan()
    const texts = [
      "DISSECTING SOCIAL-ENGINEERING HEURISTICS & SENDER SPOOFING...",
      "CROSS-REFERENCING CROSS-CHANNEL THREAT GRAPH & DNS REGISTRIES...",
      "SYNTHESIZING ATTACK TRAJECTORY & PREDICTIVE NEXT MOVE..."
    ]
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % texts.length
      setLoadingText(texts[i])
    }, 1200)
    return () => clearInterval(interval)
  }, [isScanning])

  const handleSimulate = (text: string) => {
    playCyberClick()
    setPayload('')
    let i = 0
    const typeInterval = setInterval(() => {
      setPayload(text.substring(0, i))
      i += 2
      if (i > text.length) {
        clearInterval(typeInterval)
        setPayload(text)
        playCyberClick()
      }
    }, 15)
  }

  const handleAnalyzeClick = () => {
    playCyberClick()
    onAnalyze(payload, type)
  }

  return (
    <div className="space-y-6 relative overflow-hidden">
      {isScanning && (
        <motion.div 
          initial={{ top: '-10%' }} animate={{ top: '110%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 w-full h-[2px] bg-cyber-cyan shadow-[0_0_30px_#06B6D4] z-20 pointer-events-none"
        />
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] font-bold text-cyber-cyan tracking-widest uppercase flex items-center gap-2">
           Attack Matrix 1-Tap Simulator
        </h3>
        <div className="flex gap-3 flex-wrap">
          {PRESETS.map((p) => (
            <button 
              key={p.id} 
              onClick={() => handleSimulate(p.payload)} 
              className={`text-[10px] font-mono font-bold tracking-wider px-4 py-2 rounded-lg border bg-slate-900/50 transition-all ${p.border}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="message" onValueChange={(v) => { playCyberClick(); setType(v as ScanType); }}>
        <TabsList className="bg-slate-900/80 border border-slate-700 p-1 rounded-lg">
          <TabsTrigger value="message" className="data-[state=active]:bg-cyber-surface data-[state=active]:text-cyber-cyan data-[state=active]:shadow-lg text-xs tracking-wider uppercase">[STATUS: ACTIVE] Message Scanner</TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-cyber-surface data-[state=active]:text-cyber-cyan data-[state=active]:shadow-lg text-xs tracking-wider uppercase">[STATUS: ACTIVE] URL Vector</TabsTrigger>
          <TabsTrigger value="email" disabled className="opacity-30 text-xs tracking-wider uppercase">[STATUS: COMING SOON] Email RFC</TabsTrigger>
          <TabsTrigger value="qr" disabled className="opacity-30 text-xs tracking-wider uppercase">[STATUS: COMING SOON] QR Vector</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber-cyan/20 to-cyber-neon/20 rounded-xl blur opacity-30 group-focus-within:opacity-100 transition duration-1000"></div>
        <Textarea 
          value={payload}
          onChange={e => setPayload(e.target.value)}
          placeholder="PASTE RAW PAYLOAD OR CLICK A SIMULATOR PRESET TO ARM INVESTIGATION ENGINE..."
          className="relative min-h-[160px] bg-cyber-surface border-slate-700 text-slate-100 font-mono focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan resize-none p-6 text-sm tracking-wide rounded-xl shadow-inner"
        />
        
        <div className="absolute bottom-6 right-6">
          <Button 
            disabled={!payload.trim() || isScanning}
            onClick={handleAnalyzeClick}
            className="bg-cyber-cyan hover:bg-cyber-neon text-black font-bold tracking-widest text-[11px] px-6 py-5 transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] rounded-md uppercase"
          >
            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  {loadingText}
                </motion.div>
              ) : (
                <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Search className="w-4 h-4" /> INITIALIZE DEEP INVESTIGATION
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  )
}
