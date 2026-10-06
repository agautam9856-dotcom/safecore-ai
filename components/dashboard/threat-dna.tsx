"use client"
import { ScanRecord } from '@/types/threat'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Fingerprint, Activity,  } from 'lucide-react'

interface DNACharacteristic {
  id: string;
  name: string;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  why: string;
  evidence: string;
}

const parseIndicatorsToDNA = (indicators: string[]): DNACharacteristic[] => {
  return indicators.map((ind, i) => {
    let impact: DNACharacteristic['impact'] = 'MEDIUM';
    let name = 'Suspicious Signal';
    let why = ind;

    const lower = ind.toLowerCase();
    
    // Derived mapping based on the SafeCore heuristic strings
    if (lower.includes('impersonation')) {
      impact = 'CRITICAL';
      name = 'Authority Impersonation';
      why = 'Exploits trust by masquerading as a legitimate institution.';
    } else if (lower.includes('coercion tactics')) {
      impact = 'CRITICAL';
      name = 'Coercion & Intimidation';
      why = 'Uses aggressive threats to force irrational immediate compliance.';
    } else if (lower.includes('otp/credentials')) {
      impact = 'CRITICAL';
      name = 'Credential Harvesting';
      why = 'Directly requests sensitive authentication data.';
    } else if (lower.includes('returns promised')) {
      impact = 'HIGH';
      name = 'Financial Lure';
      why = 'Promises unrealistic rewards to bypass logical skepticism.';
    } else if (lower.includes('urgency')) {
      impact = 'HIGH';
      name = 'Artificial Urgency';
      why = 'Creates a false time constraint to rush decision-making.';
    } else if (lower.includes('suspicious top-level domain')) {
      impact = 'HIGH';
      name = 'High-Risk TLD';
      why = 'Originates from a domain extension frequently used for disposable scam infrastructure.';
    } else if (lower.includes('shorteners')) {
      impact = 'MEDIUM';
      name = 'Obscured Destination';
      why = 'Uses URL shortening to hide the true malicious landing page.';
    } else if (lower.includes('external links')) {
      impact = 'LOW';
      name = 'External Redirection';
      why = 'Contains links moving the user outside the current communication channel.';
    } else if (lower.includes('bait')) {
      impact = 'HIGH';
      name = 'Social Engineering Bait';
      why = 'Uses a tailored narrative to hook the target into engaging.';
    }

    return {
      id: `dna-${i}`,
      name,
      impact,
      why,
      evidence: ind
    };
  });
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'CRITICAL': return 'text-threat-critical border-threat-critical/50 bg-threat-critical/10';
    case 'HIGH': return 'text-threat-high border-threat-high/50 bg-threat-high/10';
    case 'MEDIUM': return 'text-amber-400 border-amber-400/50 bg-amber-400/10';
    case 'LOW': return 'text-threat-low border-threat-low/50 bg-threat-low/10';
    default: return 'text-slate-400 border-slate-700 bg-slate-800';
  }
};

const getImpactHex = (impact: string) => {
  switch (impact) {
    case 'CRITICAL': return '#EF4444';
    case 'HIGH': return '#F97316';
    case 'MEDIUM': return '#F59E0B';
    case 'LOW': return '#10B981';
    default: return '#64748B';
  }
}

export function ThreatDNA({ scan }: { scan: ScanRecord }) {
  const [selectedNode, setSelectedNode] = useState<DNACharacteristic | null>(null);
  const dnaNodes = parseIndicatorsToDNA(scan.indicators);

  if (dnaNodes.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800/80 bg-[#0A0F1A]/80 flex flex-col items-center justify-center text-center gap-3">
        <Activity className="w-8 h-8 text-slate-600" />
        <h3 className="text-sm font-bold text-slate-300">No Threat DNA Isolated</h3>
        <p className="text-xs text-slate-500">No strong threat characteristics identified in this payload.</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-2 font-sans">
      <div className="bg-[#0A0F1A] border border-slate-800/80 rounded-2xl overflow-hidden shadow-inner">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Fingerprint className="w-5 h-5 text-cyber-cyan" />
            <h3 className="text-sm font-bold text-slate-100 tracking-tight uppercase">Threat DNA Profile</h3>
          </div>
          <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
            <span className="animate-pulse h-2 w-2 rounded-full bg-cyber-cyan inline-block"></span>
            {dnaNodes.length} Signatures Detected
          </div>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-8">
          
          {/* Visual Sequence */}
          <div className="flex-1 flex flex-col justify-center relative min-h-[160px]">
            {/* Horizontal DNA Axis */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-slate-800" />
            
            <div className="relative z-10 flex justify-between items-center w-full px-2">
              {dnaNodes.map((node, i) => {
                const isSelected = selectedNode?.id === node.id;
                
                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 + 0.3, type: 'spring' }}
                    className="relative group flex flex-col items-center cursor-pointer"
                    onMouseEnter={() => setSelectedNode(node)}
                    onClick={() => setSelectedNode(node)}
                  >
                    {/* Vertical Connector */}
                    <div className={`w-[1px] h-8 md:h-12 transition-colors duration-300 ${isSelected ? 'bg-cyber-cyan' : 'bg-slate-700'} ${i % 2 === 0 ? '-mb-4' : 'order-last -mt-4'}`} />
                    
                    {/* Node Point */}
                    <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 z-10 ${getImpactColor(node.impact)} ${isSelected ? 'scale-150 shadow-[0_0_15px_currentColor]' : 'hover:scale-125'}`}>
                      <div className="w-full h-full rounded-full animate-ping opacity-20" style={{ backgroundColor: getImpactHex(node.impact) }} />
                    </div>
                    
                    {/* Floating Label for Desktop */}
                    <div className={`absolute whitespace-nowrap text-[10px] font-bold tracking-wide transition-opacity duration-300 ${isSelected ? 'opacity-100 text-white' : 'opacity-0 text-slate-400 group-hover:opacity-100'} ${i % 2 === 0 ? 'bottom-full mb-6' : 'top-full mt-6'}`}>
                      {node.name}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Interactive Inspection Panel */}
          <div className="w-full md:w-[320px] shrink-0 border border-slate-800/80 bg-black/40 rounded-xl overflow-hidden h-[180px] flex flex-col">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-100 tracking-tight leading-tight pr-4">{selectedNode.name}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest ${getImpactColor(selectedNode.impact)}`}>
                      {selectedNode.impact} IMPACT
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Why it matters</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.why}</p>
                    </div>
                    
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Raw Evidence</span>
                      <p className="text-[11px] font-mono text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800/80 leading-relaxed break-words">&quot;{selectedNode.evidence}&quot;</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 flex flex-col items-center justify-center h-full text-center text-slate-500"
                >
                  <Fingerprint className="w-8 h-8 opacity-20 mb-3" />
                  <p className="text-xs font-medium">Hover or tap any DNA node<br/>to inspect the threat signature.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
