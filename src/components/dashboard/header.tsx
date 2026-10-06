"use client"
import { ShieldAlert, Globe, Database, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { playCyberClick, toggleAudioMute, getAudioMute } from '@/lib/audio'
import Link from 'next/link'

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
  return <span className="font-mono font-bold tracking-tight">{count.toLocaleString()}{suffix}</span>
}

export function Header() {
  const [muted, setMuted] = useState(false)

  const [stats, setStats] = useState({ intercepts: 4892, trajectories: 1420, sentinels: 24600 })

  const fetchTelemetry = () => {
    fetch('/api/threats/telemetry').then(r => r.json()).then(data => {
      setStats({
        intercepts: data.interactionsIntercepted,
        trajectories: data.trajectoriesMapped,
        sentinels: data.sentinelNodes
      })
    }).catch(() => {})
  }

  useEffect(() => {
    setMuted(getAudioMute())
    fetchTelemetry()
    const handleUpdate = () => fetchTelemetry()
    window.addEventListener('threats-updated', handleUpdate)
    return () => window.removeEventListener('threats-updated', handleUpdate)
  }, [])

  const handleMute = () => {
    const isNowMuted = toggleAudioMute()
    setMuted(isNowMuted)
    if (!isNowMuted) playCyberClick()
  }

  return (
    <header className="flex flex-col md:flex-row items-center justify-between py-4 px-6 md:px-8 border-b border-slate-800/80 bg-[#070B14]/90 backdrop-blur-xl sticky top-0 z-50 font-sans">
      <div className="flex items-center gap-4 mb-4 md:mb-0 cursor-pointer" onClick={playCyberClick}>
        <div className="relative flex items-center justify-center w-10 h-10 bg-[#0A0F1A] border border-cyber-cyan/40 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)] overflow-hidden group transition-all hover:border-cyber-cyan hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <div className="absolute inset-0 bg-cyber-cyan/10 animate-pulse" />
          <ShieldAlert className="w-5 h-5 text-cyber-cyan relative z-10 group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">SafeCore</h1>
          <p className="text-[10px] text-cyber-cyan font-medium tracking-widest uppercase mt-0.5 opacity-90">
            DETECT &rarr; CONNECT &rarr; PREDICT &rarr; PROTECT
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 md:gap-8">
        <div className="flex items-center gap-2.5 px-4 py-1.5 bg-threat-low/10 border border-threat-low/30 rounded-full">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-threat-low opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-threat-low"></span>
          </div>
          <span className="text-[10px] font-bold text-threat-low tracking-wide uppercase">AI NEURAL ENGINE: 28ms</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
          <Link href="/insights">
            <button className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-purple-400 border border-purple-400/30 bg-purple-400/10 px-3 py-1.5 rounded hover:bg-purple-400/20 transition-colors mr-2">
              Insights
            </button>
          </Link>
          <Link href="/safety-profile">
            <button className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-cyber-cyan border border-cyber-cyan/30 bg-cyber-cyan/10 px-3 py-1.5 rounded hover:bg-cyber-cyan/20 transition-colors mr-6">
              Safety Profile
            </button>
          </Link>
          <Link href="/">
            <button className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-slate-400 border border-slate-700 bg-[#0A0F1A] px-3 py-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors mr-6">
              Dashboard
            </button>
          </Link>
          <div className="flex flex-col items-end group">
            <span className="text-slate-500 uppercase text-[10px] tracking-wide flex items-center gap-1">Intercepts</span>
            <span className="text-slate-200 group-hover:text-white transition-colors"><AnimatedCounter target={stats.intercepts} suffix="+" /></span>
          </div>
          <div className="flex flex-col items-end border-l border-slate-800/80 pl-6 group">
            <span className="text-slate-500 uppercase text-[10px] tracking-wide flex items-center gap-1"><Database className="w-3 h-3"/> Trajectories</span>
            <span className="text-slate-200 group-hover:text-white transition-colors"><AnimatedCounter target={stats.trajectories} suffix="+" /></span>
          </div>
          <div className="flex flex-col items-end border-l border-slate-800/80 pl-6 group pr-6 border-r">
            <span className="text-slate-500 uppercase text-[10px] tracking-wide flex items-center gap-1"><Globe className="w-3 h-3"/> Sentinels</span>
            <span className="text-slate-200 group-hover:text-white transition-colors"><AnimatedCounter target={stats.sentinels} suffix="+" /></span>
          </div>
          
          <button onClick={handleMute} className="p-2 bg-[#0A0F1A] border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:text-white transition-colors group" title="Toggle UI Audio">
            {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-slate-300 group-hover:text-cyber-cyan" />}
          </button>
        </div>
      </div>
    </header>
  )
}
