const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/url-intelligence.tsx', 'utf8');

// The replacement was:
// <div className="mt-4 pt-4 border-t border-slate-800">
//             <button onClick={() => { playCyberClick(); document.getElementById('evidence-locker')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-[10px] text-cyber-cyan font-bold uppercase tracking-widest flex items-center gap-2 hover:text-cyan-300 transition-colors">
//               <ExternalLink className="w-3 h-3" /> View in Evidence Locker
//             </button>
//           </div>
//         </div>
//       </GlassCard>

// The target was missing `</div>` inside the original string `</GlassCard>`. Wait, `</div>` was actually the closing tag for `<div className="md:w-2/3">`.

code = code.replace(
  `          </div>\n        </div>\n      </GlassCard>`,
  `          </div>\n        </div>\n      </GlassCard>` // Revert back to original shape or just completely rewrite it if it's broken.
);

fs.writeFileSync('src/components/dashboard/url-intelligence.tsx', code);
