"use client"
import { useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { ThreatTicker } from '@/components/dashboard/threat-ticker'
import { ThreatScanner } from '@/components/dashboard/threat-scanner'
import { AttackPathReplay } from '@/components/dashboard/attack-path-replay'
import { ThreatAnalysisCard } from '@/components/dashboard/threat-analysis-card'
import { ActionCenter } from '@/components/dashboard/action-center'
import { SmartAlertCenter } from '@/components/dashboard/smart-alert-center'
import { EvidenceLocker } from '@/components/dashboard/evidence-locker'
import { UrlIntelligenceLab } from '@/components/dashboard/url-intelligence'
import { IntelFeed } from '@/components/dashboard/intel-feed'
import { ConstellationEntry } from '@/components/dashboard/constellation-entry'
import { ScanRecord, ScanType } from '@/types/threat'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { CommandCenterHero } from '@/components/dashboard/command-center-hero'
import { playCyberComplete } from '@/lib/audio'

export default function Dashboard() {
  const [scanResult, setScanResult] = useState<ScanRecord | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const handleAnalyze = async (payload: string, type: ScanType) => {
    setIsScanning(true)
    if (scanResult) setScanResult(null)
    
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, type })
      })
      if (!res.ok) throw new Error('API Error')
      const data = await res.json()
      
      // Cinematic 1.2s delay for the scanning sequence to match Vercel-tier speed
      setTimeout(() => {
        playCyberComplete()
        setScanResult(data)
        window.dispatchEvent(new Event('threats-updated'))
        setIsScanning(false)
      }, 1200)
    } catch {
      // Silently catch in production build to avoid UI overlays
      setIsScanning(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#070B14] text-slate-200 font-sans cyber-grid selection:bg-cyber-cyan/30 overflow-x-hidden">
      <Header />
      <ThreatTicker />
      
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-8 flex flex-col xl:flex-row gap-8">
        
        {/* Main Orchestration Column */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          
          {!scanResult && !isScanning && <CommandCenterHero />}
          
          <GlassCard withCorners className="z-10 shadow-2xl shadow-black/80 bg-[#0A0F1A]/90 border-slate-800/80">
            <ThreatScanner onAnalyze={handleAnalyze} isScanning={isScanning} />
          </GlassCard>

          <AnimatePresence mode="wait">
            {scanResult && (
              <motion.div 
                key={scanResult.id}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col gap-8"
              >
                <AttackPathReplay scan={scanResult} />

                <UrlIntelligenceLab scan={scanResult} />
                <ThreatAnalysisCard scan={scanResult} />
                <ActionCenter scan={scanResult} />
                <EvidenceLocker scan={scanResult} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Intel Sidebar */}
        <div className="w-full xl:w-[400px] flex-shrink-0">
          <ConstellationEntry />
          <IntelFeed />
        </div>

      </div>
      <SmartAlertCenter currentScan={scanResult} />
    </main>
  )
}
