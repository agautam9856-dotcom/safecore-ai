const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

if (!code.includes('CommandCenterHero')) {
  // Add import
  code = code.replace(
    `import { GlassCard } from '@/components/ui/glass-card'`,
    `import { GlassCard } from '@/components/ui/glass-card'
import { CommandCenterHero } from '@/components/dashboard/command-center-hero'`
  );

  // Insert Hero rendering before ThreatScanner if !scanResult
  code = code.replace(
    `<ThreatScanner onAnalyze={handleAnalyze} isScanning={isScanning} />`,
    `<ThreatScanner onAnalyze={handleAnalyze} isScanning={isScanning} />`
  );
  
  code = code.replace(
    `<GlassCard withCorners className="z-10 shadow-2xl shadow-black/80 bg-[#0A0F1A]/90 border-slate-800/80">
            <ThreatScanner onAnalyze={handleAnalyze} isScanning={isScanning} />
          </GlassCard>`,
    `{!scanResult && !isScanning && <CommandCenterHero />}
          
          <GlassCard withCorners className="z-10 shadow-2xl shadow-black/80 bg-[#0A0F1A]/90 border-slate-800/80">
            <ThreatScanner onAnalyze={handleAnalyze} isScanning={isScanning} />
          </GlassCard>`
  );
  fs.writeFileSync('src/app/page.tsx', code);
}
