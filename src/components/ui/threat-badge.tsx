import * as React from "react"
import { cn } from "@/lib/utils"

export type ThreatLevel = "LOW" | "SUSPICIOUS" | "HIGH" | "CRITICAL"

interface ThreatBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  level: ThreatLevel
}

const threatStyles: Record<ThreatLevel, { container: string; dot: string; text: string }> = {
  LOW: {
    container: "bg-threat-low/10 border-threat-low/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
    dot: "bg-threat-low shadow-[0_0_5px_rgba(16,185,129,0.5)]",
    text: "text-threat-low",
  },
  SUSPICIOUS: {
    container: "bg-threat-suspicious/10 border-threat-suspicious/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
    dot: "bg-threat-suspicious shadow-[0_0_6px_rgba(245,158,11,0.6)] animate-pulse",
    text: "text-threat-suspicious",
  },
  HIGH: {
    container: "bg-threat-high/15 border-threat-high/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]",
    dot: "bg-threat-high shadow-[0_0_8px_rgba(249,115,22,0.7)] animate-pulse",
    text: "text-threat-high",
  },
  CRITICAL: {
    container: "bg-threat-critical/20 border-threat-critical/60 shadow-[0_0_20px_rgba(239,68,68,0.3)] pulse-glow-red",
    dot: "bg-threat-critical shadow-[0_0_10px_rgba(239,68,68,0.9)]",
    text: "text-threat-critical font-bold",
  },
}

export function ThreatBadge({ level, className, ...props }: ThreatBadgeProps) {
  const styles = threatStyles[level]

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-xs font-medium uppercase tracking-wider backdrop-blur-md transition-colors",
        styles.container,
        className
      )}
      {...props}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", styles.dot)} aria-hidden="true" />
      <span className={styles.text}>{level}</span>
    </div>
  )
}
