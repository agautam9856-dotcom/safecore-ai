"use client"
import { motion } from 'framer-motion'

export function ThreatTicker() {
  const items = [
    "🔴 CRITICAL INTERCEPT: sbi-kyc-gateway.top (Credential Harvesting Phish)",
    "🟡 SUSPICIOUS DOMAIN: bit.ly/tele-job-payout",
    "🟢 VERIFIED SENDER: HDFCBK Official Shortcode",
    "⚡ THREAT SYNC: 240 New Community Flags in last 15m"
  ];

  return (
    <div className="bg-cyber-surface/90 border-b border-slate-800/80 overflow-hidden py-2 flex whitespace-nowrap relative z-40 backdrop-blur-md">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 30, repeat: Infinity }}
        className="flex gap-16 font-mono text-[10px] tracking-widest text-slate-400 min-w-max px-8"
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
