"use client"
import { ShieldAlert, Globe, Database, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { playCyberClick, toggleAudioMute, getAudioMute } from '@/lib/audio'

function AnimatedCounter({ target, suffix = "" }: { target: number, suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let current = 0
    const step = Math.ceil(target / 50)
    const interval = setInterval(() => {
      current += step
      if (current >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(current)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [target])
  return <span className="font-bold tracking-widest">{count.toLocaleString()}{suffix}</span>
}

export function Header() {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    setMuted(getAudioMute())
  }, [])

  const handleMute = () => {
    const isNowMuted = toggleAudioMute()
    setMuted(isNowMuted)
    if (!isNowMuted) playCyberClick()
  }

  return (
    <header className="flex flex-col md:flex-row items-center justify-between py-5 px-8 border-b border-cyber-border bg-cyber-obsidian/95 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-4 mb-4 md:mb-0 cursor-pointer" onClick={playCyberClick}>
        <div className="relative flex items-center justify-center w-12 h-12 bg-cyber-surface border border-cyber-border-highlight rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] overflow-hidden group">
          <div className="absolute inset-0 bg-cyber-cyan/20 animate-pulse" />
          <ShieldAlert className="w-6 h-6 text-cyber-cyan relative z-10 group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase shadow-cyber-cyan text-shadow-sm">SafeCore</h1>
          <p className="text-[10px] text-cyber-cyan tracking-[0.2em] mt-1 pulse-glow-cyan inline-block rounded font-bold">
            DETECT &rarr; CONNECT &rarr; PREDICT &rarr; PROTECT
          </p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 px-4 py-1.5 bg-threat-low/10 border border-threat-low/40 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)] relative overflow-hidden">
          <div className="absolute inset-0 bg-threat-low/5 animate-pulse" />
          <div className="w-2.5 h-2.5 bg-threat-low rounded-full animate-ping shadow-[0_0_8px_rgba(16,185,129,1)]" />
          <span className="text-[10px] font-bold text-threat-low tracking-widest relative z-10">AI NEURAL ENGINE: ENGAGED // MULTI-CHANNEL ACTIVE // 28ms LATENCY</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono text-slate-400">
          <div className="flex flex-col items-end group">
            <span className="text-slate-500 uppercase text-[9px] tracking-widest flex items-center gap-1">Interactions Intercepted</span>
            <span className="text-cyber-neon text-sm group-hover:text-white transition-colors"><AnimatedCounter target={4892} suffix="+" /></span>
          </div>
          <div className="flex flex-col items-end border-l border-slate-800 pl-6 group">
            <span className="text-slate-500 uppercase text-[9px] tracking-widest flex items-center gap-1"><Database className="w-3 h-3"/> Trajectories Mapped</span>
            <span className="text-white text-sm group-hover:text-cyber-cyan transition-colors"><AnimatedCounter target={1420} suffix="+" /></span>
          </div>
          <div className="flex flex-col items-end border-l border-slate-800 pl-6 group pr-6 border-r">
            <span className="text-slate-500 uppercase text-[9px] tracking-widest flex items-center gap-1"><Globe className="w-3 h-3"/> Sentinel Nodes</span>
            <span className="text-cyber-neon text-sm group-hover:text-white transition-colors"><AnimatedCounter target={24600} suffix="+" /></span>
          </div>
          
          <button onClick={handleMute} className="p-2 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 hover:text-white transition-colors group" title="Toggle UI Audio">
            {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyber-cyan group-hover:animate-pulse" />}
          </button>
        </div>
      </div>
    </header>
  )
}
