const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/header.tsx', 'utf8');

const target = `<Link href="/safety-profile">
            <button className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-cyber-cyan border border-cyber-cyan/30 bg-cyber-cyan/10 px-3 py-1.5 rounded hover:bg-cyber-cyan/20 transition-colors mr-6">
              Safety Profile
            </button>
          </Link>`;

const replacement = `<Link href="/insights">
            <button className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-purple-400 border border-purple-400/30 bg-purple-400/10 px-3 py-1.5 rounded hover:bg-purple-400/20 transition-colors mr-2">
              Insights
            </button>
          </Link>
          <Link href="/safety-profile">
            <button className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-cyber-cyan border border-cyber-cyan/30 bg-cyber-cyan/10 px-3 py-1.5 rounded hover:bg-cyber-cyan/20 transition-colors mr-6">
              Safety Profile
            </button>
          </Link>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/dashboard/header.tsx', code);
