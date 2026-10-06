import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface TelemetryMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number // 0 to 100
  showLabel?: boolean
}

function getRiskColor(value: number) {
  if (value <= 30) return "bg-threat-low shadow-[0_0_8px_rgba(16,185,129,0.5)]"
  if (value <= 60) return "bg-threat-suspicious shadow-[0_0_8px_rgba(245,158,11,0.5)]"
  if (value <= 80) return "bg-threat-high shadow-[0_0_8px_rgba(249,115,22,0.5)]"
  return "bg-threat-critical shadow-[0_0_12px_rgba(239,68,68,0.7)]"
}

export function TelemetryMeter({ value, showLabel = true, className, ...props }: TelemetryMeterProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const colorClass = getRiskColor(clampedValue)

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400">THREAT_INDEX</span>
          <span className={cn("font-bold", {
            "text-threat-low": clampedValue <= 30,
            "text-threat-suspicious": clampedValue > 30 && clampedValue <= 60,
            "text-threat-high": clampedValue > 60 && clampedValue <= 80,
            "text-threat-critical": clampedValue > 80,
          })}>
            {clampedValue.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/50">
        <motion.div
          className={cn("h-full rounded-full transition-colors duration-500", colorClass)}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}
