"use client"
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, AlertTriangle, ShieldAlert, CheckCircle, ChevronRight, Activity, Eye, PlayCircle, EyeOff } from 'lucide-react'
import { ScanRecord } from '@/types/threat'
import { SmartAlert, AlertPriority } from '@/types/alert'
import { generateAlerts, getPriorityColor } from '@/lib/alert-engine'
import { playCyberClick, playCyberScan } from '@/lib/audio'
import { getRecentScans } from '@/lib/threat-service'

export function SmartAlertCenter({ currentScan }: { currentScan: ScanRecord | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [alerts, setAlerts] = useState<SmartAlert[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [selectedAlert, setSelectedAlert] = useState<SmartAlert | null>(null)
  
  // Reload alerts whenever currentScan changes
  useEffect(() => {
    async function load() {
      const scans = await getRecentScans()
      // If currentScan is not in recent scans (e.g. mock save failed), inject it for alert evaluation
      if (currentScan && !scans.find(s => s.id === currentScan.id)) {
        scans.unshift(currentScan)
      }
      setAlerts(generateAlerts(scans))
    }
    load()
  }, [currentScan])

  const unreadCount = alerts.filter(a => !a.isRead).length
  
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (filter === 'UNREAD') return !a.isRead
      if (filter === 'ACTION REQUIRED') return a.type === 'ACTION_REQUIRED'
      if (filter === 'HIGH') return a.priority === 'HIGH' || a.priority === 'CRITICAL'
      return true
    })
  }, [alerts, filter])

  const handleMarkAsRead = (id: string) => {
    playCyberClick()
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a))
  }

  const handleMarkAllRead = () => {
    playCyberClick()
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })))
  }

  const handleFollowAlert = (_alert: SmartAlert) => {
    playCyberScan()
    setIsOpen(false)
    // In a real app we'd dispatch this scan to the master view. 
    // For this prototype, we'll smoothly scroll to the top where the scan result is.
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const PriorityBadge = ({ priority }: { priority: AlertPriority }) => {
    return (
      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getPriorityColor(priority)}`}>
        {priority}
      </span>
    )
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => { playCyberClick(); setIsOpen(true); }}
          className="relative flex items-center justify-center w-14 h-14 bg-[#0A0F1A] border border-slate-700 hover:border-cyber-cyan/50 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all group"
        >
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-threat-critical opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-threat-critical text-white text-[10px] font-bold items-center justify-center border border-[#0A0F1A]">
                {unreadCount}
              </span>
            </span>
          )}
          <Bell className={`w-6 h-6 text-slate-300 group-hover:text-cyber-cyan transition-colors ${unreadCount > 0 ? 'animate-pulse text-threat-critical' : ''}`} />
        </button>
      </div>

      {/* Overlay & Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#070B14] border-l border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col font-sans"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800/80 bg-[#0A0F1A] flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyber-cyan" /> SMART ALERT CENTER
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Important context-aware safety events.</p>
                </div>
                <button onClick={() => { playCyberClick(); setIsOpen(false); }} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Filters */}
              <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex gap-2">
                  {['ALL', 'UNREAD', 'HIGH'].map(f => (
                    <button 
                      key={f} onClick={() => { playCyberClick(); setFilter(f); setSelectedAlert(null); }}
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${filter === f ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30' : 'bg-black/40 text-slate-400 border border-slate-800 hover:text-slate-200'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Mark All Read
                  </button>
                )}
              </div>

              {/* Alert List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#070B14]">
                <AnimatePresence>
                  {filteredAlerts.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                      <CheckCircle className="w-12 h-12 mb-4" />
                      <h3 className="text-sm font-bold tracking-tight">You&apos;re all caught up.</h3>
                      <p className="text-xs text-center max-w-[200px] mt-2">SafeCore will surface important changes when meaningful activity is detected.</p>
                    </motion.div>
                  ) : (
                    filteredAlerts.map(alert => (
                      <motion.div 
                        key={alert.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        className={`mb-4 border rounded-xl overflow-hidden transition-all ${
                          selectedAlert?.id === alert.id 
                            ? 'border-cyber-cyan/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-slate-900/50' 
                            : !alert.isRead ? 'border-slate-600 bg-[#0A0F1A]' : 'border-slate-800/80 bg-black/40 opacity-70'
                        }`}
                      >
                        {/* Summary View */}
                        <div 
                          onClick={() => { playCyberClick(); setSelectedAlert(selectedAlert?.id === alert.id ? null : alert); if (!alert.isRead) handleMarkAsRead(alert.id); }}
                          className="p-4 cursor-pointer hover:bg-slate-900/50 flex flex-col gap-3"
                        >
                          <div className="flex justify-between items-start">
                            <PriorityBadge priority={alert.priority} />
                            <span className="text-[10px] text-slate-500 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-200">{alert.title}</h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{alert.summary}</p>
                          </div>
                        </div>

                        {/* Detailed Expanded View */}
                        <AnimatePresence>
                          {selectedAlert?.id === alert.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                              className="border-t border-slate-800 bg-[#070B14] p-4 flex flex-col gap-5"
                            >
                              
                              {/* WHY NOW? */}
                              <div>
                                <span className="text-[10px] text-cyber-cyan font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                  <AlertTriangle className="w-3 h-3" /> WHY NOW?
                                </span>
                                <ul className="space-y-1">
                                  {alert.whyNow.map((reason, i) => (
                                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                      <span className="text-slate-600 mt-0.5">•</span> {reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* WHAT CHANGED? */}
                              {alert.whatChanged && (
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">WHAT CHANGED?</span>
                                  <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                      <span className="text-slate-500 block mb-1">Before</span>
                                      <span className="text-slate-300 font-medium">{alert.whatChanged.before}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block mb-1">Now</span>
                                      <span className="text-threat-high font-bold">{alert.whatChanged.now}</span>
                                    </div>
                                  </div>
                                  {alert.whatChanged.riskChange && (
                                    <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
                                      <span className="text-xs text-slate-500">Risk Score Shift</span>
                                      <span className="text-xs font-mono font-bold text-threat-critical">{alert.whatChanged.riskChange}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* ACTION & FOLLOW */}
                              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">RECOMMENDED ACTION</span>
                                <div className="text-sm font-bold text-slate-200 mb-3">{alert.actionRecommendation}</div>
                                
                                <button 
                                  onClick={() => handleFollowAlert(alert)}
                                  className="w-full flex items-center justify-center gap-2 bg-cyber-cyan text-[#070B14] font-bold text-xs uppercase tracking-widest py-3 rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                                >
                                  <PlayCircle className="w-4 h-4" /> FOLLOW ALERT
                                </button>
                              </div>

                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
