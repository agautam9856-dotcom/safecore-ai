import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  withGlow?: boolean
  withCorners?: boolean
  glowColor?: "cyan" | "red"
  children?: React.ReactNode
}

export function GlassCard({
  className,
  children,
  withGlow = false,
  withCorners = false,
  glowColor = "cyan",
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative glass-panel rounded-lg p-6 overflow-hidden group transition-all duration-300",
        withGlow && glowColor === "cyan" && "hover:pulse-glow-cyan hover:border-cyber-border-highlight",
        withGlow && glowColor === "red" && "hover:pulse-glow-red hover:border-threat-critical",
        className
      )}
      {...props}
    >
      {/* Corner Brackets */}
      {withCorners && (
        <>
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-cyan/50 rounded-tl-sm pointer-events-none" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-cyan/50 rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyber-cyan/50 rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyber-cyan/50 rounded-br-sm pointer-events-none" />
        </>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
