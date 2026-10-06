"use client"
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ConstellationNode, ConstellationEdge, ThreatCluster } from '@/types/correlation'
import { buildThreatConstellation, getDemoConstellation } from '@/lib/correlation-engine'
import { Network, Search, AlertTriangle, ShieldCheck, Activity, Link2, Info, ChevronRight, PlayCircle, Loader2 } from 'lucide-react'
import { Header } from '@/components/dashboard/header'
import { ThreatBadge } from '@/components/ui/threat-badge'
import { playCyberClick, playCyberScan, playCyberComplete } from '@/lib/audio'

export default function ConstellationPage() {
  const [cluster, setCluster] = useState<ThreatCluster | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealText, setRevealText] = useState('')
  
  const [selectedNode, setSelectedNode] = useState<ConstellationNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<ConstellationEdge | null>(null)
  
  const [isDemo, setIsDemo] = useState(false)
  const [replayIndex, setReplayIndex] = useState<number>(-1)

  // Initialization
  useEffect(() => {
    buildThreatConstellation().then(data => {
      setCluster(data)
    })
  }, [])

  const handleReveal = (forceDemo = false) => {
    playCyberClick()
    setIsRevealing(true)
    setRevealed(false)
    setReplayIndex(-1)
    
    if (forceDemo) {
      setIsDemo(true)
      setCluster(getDemoConstellation())
    }

    const steps = [
      "Scanning previous observations...",
      "Extracting entities...",
      "Comparing signals...",
      "Checking Threat Memory...",
      "Searching relationships...",
      "Potential connection detected",
      "THREAT CLUSTER DISCOVERED"
    ]
    
    let i = 0
    playCyberScan()
    const interval = setInterval(() => {
      setRevealText(steps[i])
      i++
      if (i >= steps.length) {
        clearInterval(interval)
        setTimeout(() => {
          playCyberComplete()
          setIsRevealing(false)
          setRevealed(true)
          setReplayIndex(100) // show all
        }, 800)
      }
    }, 600)
  }

  const handleReplay = () => {
    playCyberClick()
    setSelectedNode(null)
    setSelectedEdge(null)
    setReplayIndex(0)
    let idx = 0
    const interval = setInterval(() => {
      idx++
      setReplayIndex(idx)
      if (idx >= (cluster?.nodes.length || 0) + (cluster?.edges.length || 0)) {
        clearInterval(interval)
        setReplayIndex(100)
      }
    }, 800)
  }

  const handleNodeClick = (n: ConstellationNode) => {
    playCyberClick()
    setSelectedEdge(null)
    setSelectedNode(n === selectedNode ? null : n)
  }

  const handleEdgeClick = (e: ConstellationEdge) => {
    playCyberClick()
    setSelectedNode(null)
    setSelectedEdge(e === selectedEdge ? null : e)
  }


  const getRiskClass = (risk: string) => {
    if (risk === 'CRITICAL') return 'border-threat-critical/50 text-threat-critical shadow-[0_0_15px_rgba(239,68,68,0.3)]'
    if (risk === 'HIGH') return 'border-threat-high/50 text-threat-high shadow-[0_0_15px_rgba(249,115,22,0.3)]'
    if (risk === 'SUSPICIOUS') return 'border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
    return 'border-threat-low/50 text-threat-low shadow-[0_0_15px_rgba(16,185,129,0.3)]'
  }

  // Focus Mode Logic
  const isNodeFaded = (nId: string) => {
    if (!selectedNode && !selectedEdge) return false
    if (selectedNode) {
      if (nId === selectedNode.id) return false
      // Is connected to selected node?
      const isConnected = cluster?.edges.some(e => (e.source === selectedNode.id && e.target === nId) || (e.target === selectedNode.id && e.source === nId))
      return !isConnected
    }
    if (selectedEdge) {
      return nId !== selectedEdge.source && nId !== selectedEdge.target
    }
    return false
  }

  const isEdgeFaded = (eId: string) => {
    if (!selectedNode && !selectedEdge) return false
    if (selectedEdge) return eId !== selectedEdge.id
    if (selectedNode) {
      const e = cluster?.edges.find(edge => edge.id === eId)
      return e?.source !== selectedNode.id && e?.target !== selectedNode.id
    }
    return false
  }

  if (!cluster) return <div className="min-h-screen bg-[#070B14] cyber-grid flex items-center justify-center"><Loader2 className="animate-spin text-cyber-cyan w-8 h-8" /></div>

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-200 font-sans cyber-grid overflow-hidden">
      <Header />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-800/80 bg-black/40 backdrop-blur-xl relative z-40">
        <div className="flex items-center gap-3">
          <Network className="w-5 h-5 text-cyber-cyan" />
          <h2 className="text-sm font-bold text-slate-100 tracking-tight uppercase">Threat Constellation Map</h2>
          {isDemo && <span className="text-[10px] bg-amber-500/20 text-amber-500 border border-amber-500/50 px-2 py-0.5 rounded font-bold tracking-widest uppercase ml-3 animate-pulse">DEMO MODE ACTIVE</span>}
        </div>
        <div className="flex gap-3">
          {revealed && (
            <button onClick={handleReplay} className="flex items-center gap-2 text-[11px] font-bold tracking-wide uppercase px-4 py-2 border border-slate-700 rounded bg-slate-800/50 hover:bg-slate-700 transition-colors">
              <PlayCircle className="w-3 h-3 text-cyber-cyan" /> Replay Journey
            </button>
          )}
          {!revealed && !isRevealing && (
            <div className="flex gap-2">
              {cluster.nodes.length > 0 && (
                <button onClick={() => handleReveal(false)} className="flex items-center gap-2 text-[11px] font-bold tracking-wide uppercase px-4 py-2 border border-cyber-cyan/50 rounded bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Search className="w-3 h-3" /> Reveal Hidden Connections
                </button>
              )}
              <button onClick={() => handleReveal(true)} className="flex items-center gap-2 text-[11px] font-bold tracking-wide uppercase px-4 py-2 border border-amber-500/50 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                Load KYC Demo Scenario
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden flex">
        
        {/* Reveal Overlay */}
        <AnimatePresence>
          {isRevealing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#070B14]/95 backdrop-blur-sm">
              <RadarSweep />
              <div className="mt-8 text-center h-12">
                <motion.p key={revealText} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`text-sm font-bold tracking-widest uppercase ${revealText.includes('DISCOVERED') ? 'text-threat-critical scale-110 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-cyber-cyan'}`}>
                  {revealText}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!isRevealing && !revealed && cluster.nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-60">
            <Network className="w-16 h-16 text-slate-700 mb-6" />
            <h2 className="text-xl font-bold tracking-tight text-slate-300">YOUR THREAT CONSTELLATION IS EMPTY</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-md">Analyze more signals in the dashboard and SafeCore will automatically look for hidden relationships and cross-scan infrastructure.</p>
          </div>
        )}

        {/* The Graph Canvas */}
        {revealed && (
          <div className="flex-1 relative overflow-auto custom-scrollbar">
            <div className="min-w-[1600px] min-h-[800px] relative">
              
              {/* Central Threat Cluster Background Highlight */}
              {cluster.main_threat && (
                <div className="absolute left-[300px] top-[200px] w-[800px] h-[300px] bg-threat-critical/5 rounded-[100%] blur-3xl pointer-events-none" />
              )}

              {/* Draw Edges */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#334155" />
                  </marker>
                  <marker id="arrowhead-highlight" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#06B6D4" />
                  </marker>
                </defs>
                {cluster.edges.map((edge, i) => {
                  const src = cluster.nodes.find(n => n.id === edge.source)
                  const tgt = cluster.nodes.find(n => n.id === edge.target)
                  if (!src || !tgt) return null
                  
                  // Replay logic
                  if (replayIndex < cluster.nodes.length + i) return null

                  const faded = isEdgeFaded(edge.id)
                  const selected = selectedEdge?.id === edge.id
                  const isNodeSelectedFocus = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id)
                  
                  const strokeColor = selected || isNodeSelectedFocus ? '#06B6D4' : (faded ? '#1E293B' : '#334155')
                  const markerId = selected || isNodeSelectedFocus ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)'

                  // Path logic
                  const startX = src.x + 80 // offset for node width roughly
                  const startY = src.y + 40
                  const endX = tgt.x - 20
                  const endY = tgt.y + 40
                  const cpX = (startX + endX) / 2
                  const pathD = `M ${startX} ${startY} C ${cpX} ${startY}, ${cpX} ${endY}, ${endX} ${endY}`

                  return (
                    <g key={edge.id}>
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8 }}
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={selected ? 3 : 2}
                        markerEnd={faded ? "" : markerId}
                        className={`transition-colors duration-500 ${selected ? 'drop-shadow-[0_0_8px_#06B6D4]' : ''}`}
                      />
                      {/* Invisible thicker path for clicking */}
                      <path
                        d={pathD} fill="none" stroke="transparent" strokeWidth={20}
                        className="pointer-events-auto cursor-pointer"
                        onClick={() => handleEdgeClick(edge)}
                      />
                    </g>
                  )
                })}
              </svg>

              {/* Draw Nodes */}
              {cluster.nodes.map((node, i) => {
                if (replayIndex < i) return null
                const faded = isNodeFaded(node.id)
                const selected = selectedNode?.id === node.id

                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: faded ? 0.3 : 1, scale: selected ? 1.05 : 1 }}
                    className={`absolute z-10 w-[180px] p-3 cursor-pointer rounded-xl border bg-[#0A0F1A]/90 backdrop-blur-md transition-all duration-300 ${selected ? getRiskClass(node.risk_level) : 'border-slate-700/80 hover:border-slate-500'}`}
                    style={{ left: node.x, top: node.y }}
                    onClick={() => handleNodeClick(node)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">{node.type}</span>
                    </div>
                    <div className={`text-sm font-bold truncate ${selected ? 'text-white' : 'text-slate-300'}`} title={node.label}>
                      {node.label}
                    </div>
                    {node.details && (
                      <div className="text-[10px] text-slate-500 mt-1 truncate">{node.details}</div>
                    )}
                    {/* Tiny pulsing dot if critical */}
                    {node.risk_level === 'CRITICAL' && !faded && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-threat-critical shadow-[0_0_10px_#EF4444] animate-pulse" />
                    )}
                  </motion.div>
                )
              })}

            </div>
          </div>
        )}

        {/* Investigation Side Panel (Right) */}
        <AnimatePresence>
          {revealed && (selectedNode || selectedEdge || cluster.main_threat) && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
              className="w-[400px] border-l border-slate-800/80 bg-[#070B14]/95 backdrop-blur-2xl flex flex-col relative z-50 h-full overflow-y-auto custom-scrollbar"
            >
              
              {/* If Edge Selected */}
              {selectedEdge && (
                <div className="p-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Link2 className="w-4 h-4 text-cyber-cyan" /> Relationship Inspector</h3>
                  <div className="bg-black/30 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Connection Matrix</span>
                      <div className="flex items-center gap-2 text-sm text-slate-300 font-bold">
                        <span className="truncate max-w-[100px]" title={cluster.nodes.find(n => n.id === selectedEdge.source)?.label}>{cluster.nodes.find(n => n.id === selectedEdge.source)?.label}</span>
                        <ChevronRight className="w-4 h-4 text-cyber-cyan shrink-0" />
                        <span className="truncate max-w-[100px]" title={cluster.nodes.find(n => n.id === selectedEdge.target)?.label}>{cluster.nodes.find(n => n.id === selectedEdge.target)?.label}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Relationship Type</span>
                      <span className="text-xs font-mono bg-cyber-cyan/10 text-cyber-cyan px-2 py-1 rounded border border-cyber-cyan/30">{selectedEdge.type}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Correlation Confidence</span>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyber-cyan shadow-[0_0_10px_#06B6D4]" style={{ width: `${selectedEdge.confidence}%` }} />
                        </div>
                        <span className="text-xs font-bold text-cyber-cyan">{selectedEdge.confidence}%</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Evidence</span>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded">{selectedEdge.evidence}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* If Node Selected */}
              {selectedNode && !selectedEdge && (
                <div className="p-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Info className="w-4 h-4 text-cyber-cyan" /> Node Inspector</h3>
                  <div className="bg-black/30 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="pb-3 border-b border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">{selectedNode.type} Entity</span>
                      <span className="text-lg text-slate-100 font-bold break-all leading-tight">{selectedNode.label}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Risk Profile</span>
                        <ThreatBadge level={selectedNode.risk_level} className="scale-75 origin-left" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Observations</span>
                        <span className="text-sm font-mono text-slate-200 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700">{selectedNode.observation_count}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">First Seen</span>
                      <span className="text-xs text-slate-300 font-mono">{new Date(selectedNode.first_seen).toLocaleString()}</span>
                    </div>

                    {selectedNode.threat_dna && selectedNode.threat_dna.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-2">Attached Threat DNA</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedNode.threat_dna.map((dna, idx) => (
                            <span key={idx} className="text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-1 rounded tracking-wide uppercase">{dna}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* If nothing selected, show Cluster Summary */}
              {!selectedNode && !selectedEdge && cluster.main_threat && (
                <div className="p-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-cyber-cyan" /> Constellation Story</h3>
                  
                  <div className="border border-threat-critical/40 bg-threat-critical/5 rounded-xl p-5 mb-5 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
                    <span className="text-[10px] text-threat-critical font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2"><AlertTriangle className="w-3 h-3" /> Threat Cluster Discovered</span>
                    <span className="text-base font-bold text-slate-100 block mb-2 leading-tight">{cluster.main_threat.category}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="bg-black/40 px-2 py-1 rounded border border-slate-800"><span className="text-slate-500">Risk:</span> <span className="text-threat-critical font-bold">{cluster.main_threat.risk_score}/100</span></span>
                      <span className="bg-black/40 px-2 py-1 rounded border border-slate-800"><span className="text-slate-500">Confidence:</span> <span className="text-cyber-cyan font-bold">{cluster.main_threat.correlation_confidence}%</span></span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">What we found</span>
                      <p className="text-sm text-slate-300 leading-relaxed">{cluster.main_threat.summary}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Why it matters</span>
                      <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-slate-700 pl-3">{cluster.main_threat.why_it_matters}</p>
                    </div>
                    <div className="bg-threat-low/5 border border-threat-low/20 rounded-lg p-4">
                      <span className="text-[10px] text-threat-low font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1"><ShieldCheck className="w-3 h-3" /> What to do</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{cluster.main_threat.what_to_do}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

function RadarSweep() {
  return (
    <div className="relative w-32 h-32 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/5 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_70%,rgba(6,182,212,0.4)_100%)] animate-spin" style={{ animationDuration: '2s', animationTimingFunction: 'linear' }} />
      <div className="w-2 h-2 rounded-full bg-cyber-cyan shadow-[0_0_15px_#06B6D4]" />
      <div className="absolute inset-0 border-[0.5px] border-cyber-cyan/10 rounded-full scale-50" />
      <div className="absolute inset-0 border-[0.5px] border-cyber-cyan/10 rounded-full scale-75" />
    </div>
  )
}
