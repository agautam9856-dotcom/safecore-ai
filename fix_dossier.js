const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/action-center.tsx', 'utf8');

const targetHtml = `<div className="bg-[#0A0F1A] p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 font-medium text-xs block mb-1">COMPOSITE RISK INDEX</span>`;

const replacementHtml = `<div className="bg-[#0A0F1A] p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 font-medium text-xs block mb-1">ORIGIN CONTACT</span>
                <span className="text-slate-200 font-mono text-xs">{scan.journey_nodes[0]?.type === 'terminal' || !scan.journey_nodes[0]?.evidence?.length ? 'Not Provided (Direct Message Body)' : scan.journey_nodes[0]?.label}</span>
              </div>
              <div className="bg-[#0A0F1A] p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 font-medium text-xs block mb-1">COMPOSITE RISK INDEX</span>`;

code = code.replace(targetHtml, replacementHtml);

fs.writeFileSync('src/components/dashboard/action-center.tsx', code);
