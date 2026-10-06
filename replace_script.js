const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

const target = `<GlassCard className="overflow-visible p-0 shadow-2xl shadow-black/50 border-slate-800/80 bg-[#0A0F1A]/90">
                  <div className="px-6 py-4 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-sm font-bold text-slate-100 tracking-tight">Interactive Attack Trajectory</h2>
                    <span className="text-[10px] font-bold bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 px-3 py-1.5 rounded-md uppercase tracking-wide">Select Nodes For Forensics</span>
                  </div>
                  <div className="px-4">
                    <ScamJourney nodes={scanResult.journey_nodes} />
                  </div>
                </GlassCard>`;

const replacement = `<AttackPathReplay scan={scanResult} />`;

code = code.replace(target, replacement);
fs.writeFileSync('src/app/page.tsx', code);
