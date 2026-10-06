const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/url-intelligence.tsx', 'utf8');

code = code.replace(
`        </div>
      <div className="mt-4 pt-4 border-t border-slate-800">
            <button onClick={() => { playCyberClick(); document.getElementById('evidence-locker')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-[10px] text-cyber-cyan font-bold uppercase tracking-widest flex items-center gap-2 hover:text-cyan-300 transition-colors">
              <ExternalLink className="w-3 h-3" /> View in Evidence Locker
            </button>
          </div>
        </div>
      </GlassCard>`,
`          <div className="mt-4 pt-4 border-t border-slate-800">
            <button onClick={() => { playCyberClick(); document.getElementById('evidence-locker')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-[10px] text-cyber-cyan font-bold uppercase tracking-widest flex items-center gap-2 hover:text-cyan-300 transition-colors">
              <ExternalLink className="w-3 h-3" /> View in Evidence Locker
            </button>
          </div>
        </div>
      </GlassCard>`
);

fs.writeFileSync('src/components/dashboard/url-intelligence.tsx', code);
