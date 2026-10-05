"use client"
import { useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { ThreatTicker } from '@/components/dashboard/threat-ticker'
import { ThreatScanner } from '@/components/dashboard/threat-scanner'
import { ScamJourney } from '@/components/dashboard/scam-journey'
import { ThreatAnalysisCard } from '@/components/dashboard/threat-analysis-card'
import { ActionCenter } from '@/components/dashboard/action-center'
import { IntelFeed } from '@/components/dashboard/intel-feed'
import { ScanRecord, ScanType } from '@/types/threat'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { playCyberComplete } from '@/lib/audio'

export default function Dashboard() {
  const [scanResult, setScanResult] = useState<ScanRecord | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const handleAnalyze = async (payload: string, type: ScanType) => {
    setIsScanning(true)
    if (scanResult) setScanResult(null)
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, type })
      })
      if (!res.ok) throw new Error('API Error')
      const data = await res.json()
      
      // Cinematic 3.6s delay for the 3-phase scanning sequence
      setTimeout(() => {
        playCyberComplete()
        setScanResult(data)
        setIsScanning(false)
      }, 3600)
    } catch (e) {
      console.error(e)
      setIsScanning(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#05080F] text-slate-200 font-sans cyber-grid selection:bg-cyber-cyan/30 overflow-x-hidden">
      <Header />
      <ThreatTicker />
      
      <div className="flex-1 max-w-[1800px] w-full mx-auto p-4 md:p-8 flex flex-col xl:flex-row gap-8">
        
        {/* Main Orchestration Column */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          
          <GlassCard withCorners className="z-10 shadow-2xl shadow-black/80">
            <ThreatScanner onAnalyze={handleAnalyze} isScanning={isScanning} />
          </GlassCard>

          <AnimatePresence mode="wait">
            {scanResult && (
              <motion.div 
                key={scanResult.id}
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col gap-8"
              >
                <GlassCard className="overflow-visible p-0 shadow-2xl shadow-black/50 border-cyber-border-highlight/50">
                  <div className="px-8 py-5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between rounded-t-xl">
                    <h2 className="text-xs font-bold text-cyber-cyan tracking-[0.2em] uppercase">Interactive Scam Journey Graph</h2>
                    <span className="text-[9px] font-mono bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 px-3 py-1.5 rounded uppercase tracking-widest animate-pulse">Select Nodes For Forensic Telemetry</span>
                  </div>
                  <div className="px-4">
                    <ScamJourney nodes={scanResult.journey_nodes} />
                  </div>
                </GlassCard>

                <ThreatAnalysisCard scan={scanResult} />
                <ActionCenter scan={scanResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Intel Sidebar */}
        <div className="w-full xl:w-[420px] flex-shrink-0">
          <IntelFeed />
        </div>

      </div>
    </main>
  )
}
