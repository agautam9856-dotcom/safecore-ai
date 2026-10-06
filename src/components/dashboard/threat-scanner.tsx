"use client"
import { useState, useEffect, useRef } from 'react'
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
  { id: 'sbi', label: '🔴 Simulate: SBI KYC Account Suspension', payload: 'SBI ALERT: Your NetBanking account is suspended due to expired KYC. Verify your identity immediately at https://sbi-kyc-portal.cc/login to prevent permanent blockage.', border: 'border-red-500/30 hover:border-red-500/70 hover:bg-red-950/30 text-red-100' },
  { id: 'telegram', label: '🟠 Simulate: Telegram ₹5,000/Day Task Scam', payload: 'Congratulations! You have been selected for part-time YouTube rating tasks earning Rs 5,000/day. Contact HR on Telegram: https://t.me/job_recruiter_2026.', border: 'border-orange-500/30 hover:border-orange-500/70 hover:bg-orange-950/30 text-orange-100' },
  { id: 'post', label: '🟡 Simulate: India Post Delivery Fee Bait', payload: 'India Post: Your package is held at depot due to an unpaid shipping fee of Rs 3.99. Pay here to release: bit.ly/indpost-fee', border: 'border-amber-500/30 hover:border-amber-500/70 hover:bg-amber-950/30 text-amber-100' }
]

export function ThreatScanner({ onAnalyze, isScanning }: ThreatScannerProps) {
  const [payload, setPayload] = useState('')
  const [errorHighlight, setErrorHighlight] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [type, setType] = useState<ScanType>('message')
  const [loadingText, setLoadingText] = useState('DISSECTING SOCIAL-ENGINEERING HEURISTICS & SENDER SPOOFING...')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
        textareaRef.current?.focus()
      }
    }, 10)
  }

  const handleAnalyzeClick = () => {
    if (payload.trim().length === 0) {
      setErrorHighlight(true)
      setToastMsg('Enter a message, phone number, or URL to analyze.')
      setTimeout(() => { setErrorHighlight(false); setToastMsg('') }, 3000)
      return
    }

    playCyberClick()
    onAnalyze(payload.trim(), type)
  }

  return (
    <div className="space-y-6 relative overflow-hidden font-sans">
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-4 right-4 z-50 bg-amber-500/10 border border-amber-500 text-amber-500 text-xs font-bold px-4 py-2 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
      {isScanning && (
        <motion.div 
          initial={{ top: '-10%' }} animate={{ top: '110%' }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 w-full h-[2px] bg-cyber-cyan shadow-[0_0_30px_#06B6D4] z-20 pointer-events-none"
        />
      )}

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
           Attack Matrix Simulator
        </h3>
        <div className="flex gap-3 flex-wrap">
          {PRESETS.map((p) => (
            <button 
              key={p.id} 
              onClick={() => handleSimulate(p.payload)} 
              className={`text-xs font-semibold px-4 py-2 rounded-lg border bg-slate-900/40 transition-all ${p.border}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="message" onValueChange={(v) => { playCyberClick(); setType(v as ScanType); }}>
        <TabsList className="bg-slate-900/60 border border-slate-800 p-1 rounded-lg">
          <TabsTrigger value="message" className="data-[state=active]:bg-cyber-surface data-[state=active]:text-cyber-cyan data-[state=active]:shadow-md font-medium text-xs tracking-wide">[STATUS: ACTIVE] Message Scanner</TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-cyber-surface data-[state=active]:text-cyber-cyan data-[state=active]:shadow-md font-medium text-xs tracking-wide">[STATUS: ACTIVE] URL Vector</TabsTrigger>
          <TabsTrigger value="email" disabled className="opacity-40 font-medium text-xs tracking-wide">[STATUS: COMING SOON] Email RFC</TabsTrigger>
          <TabsTrigger value="qr" disabled className="opacity-40 font-medium text-xs tracking-wide">[STATUS: COMING SOON] QR Vector</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative group rounded-xl">
        <div className="absolute -inset-px bg-gradient-to-r from-cyber-cyan/30 to-blue-500/30 rounded-xl opacity-0 group-focus-within:opacity-100 transition duration-500 blur-sm pointer-events-none"></div>
        <Textarea 
          ref={textareaRef}
          value={payload}
          onChange={e => setPayload(e.target.value)}
          placeholder="Paste raw payload or click a simulator preset to arm investigation engine..."
          className={`relative min-h-[160px] bg-[#0A0F1A] text-slate-100 font-mono focus:ring-1 resize-none p-6 text-sm tracking-wide rounded-xl shadow-inner placeholder:text-slate-600 placeholder:font-sans transition-colors ${errorHighlight ? 'border-amber-500 ring-1 ring-amber-500 focus:border-amber-500 focus:ring-amber-500' : 'border-slate-700/80 focus:border-cyber-cyan focus:ring-cyber-cyan'}`}
        />
        
        <div className="absolute bottom-6 right-6 z-10">
          <Button 
            disabled={isScanning}
            onClick={handleAnalyzeClick}
            className="bg-slate-100 hover:bg-white text-black font-bold tracking-tight px-6 py-5 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] rounded-lg"
          >
            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span className="font-mono text-[10px] uppercase tracking-widest">{loadingText}</span>
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
