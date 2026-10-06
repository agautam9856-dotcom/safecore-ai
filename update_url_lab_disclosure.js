const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/url-intelligence.tsx', 'utf8');

const target = `    </div>
  )
}
`;

const replacement = `
      {/* INFRASTRUCTURE LIMITATIONS */}
      <GlassCard className="bg-[#0A0F1A] border-slate-800 p-6">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> ADVANCED INSPECTION STATUS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-black/40 border border-slate-800 rounded-lg">
            <span className="text-xs font-bold text-slate-300 block mb-1">Redirect Chain Analysis</span>
            <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Unavailable in Environment</span>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              SafeCore has suspended automated HTTP redirect tracing to strictly enforce SSRF (Server-Side Request Forgery) network safety policies.
            </p>
          </div>
          <div className="p-4 bg-black/40 border border-slate-800 rounded-lg">
            <span className="text-xs font-bold text-slate-300 block mb-1">Deep Website Inspection</span>
            <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Requires Headless Proxy</span>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              Dynamic DOM crawling and payload execution are disabled. SafeCore will not interact directly with the destination infrastructure.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/dashboard/url-intelligence.tsx', code);
