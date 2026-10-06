"use client"
import { GlassCard } from '@/components/ui/glass-card'
import { Network, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { playCyberClick } from '@/lib/audio'

export function ConstellationEntry() {
  return (
    <GlassCard className="bg-[#0A0F1A]/80 border-slate-800/80 mb-6 font-sans group">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <Network className="w-4 h-4 text-cyber-cyan" /> Cross-Scan Intelligence
        </h3>
        <span className="animate-pulse w-2 h-2 rounded-full bg-cyber-cyan shadow-[0_0_8px_#06B6D4]" />
      </div>
      
      <p className="text-xs text-slate-400 mb-4">SafeCore has detected hidden relationships forming a potential threat cluster.</p>
      
      <div className="flex items-center justify-between bg-black/40 border border-slate-800 rounded-lg p-3">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Active Clusters</span>
          <span className="text-sm font-bold text-slate-200">1 High-Confidence</span>
        </div>
        <Link href="/constellation" onClick={playCyberClick} className="flex items-center gap-1.5 text-xs font-bold bg-cyber-cyan/10 text-cyber-cyan hover:bg-cyber-cyan/20 px-3 py-1.5 rounded transition-colors border border-cyber-cyan/30">
          EXPLORE <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </GlassCard>
  )
}
