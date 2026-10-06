const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Insert import if not exists
if (!code.includes('UrlIntelligenceLab')) {
  code = code.replace(
    "import { EvidenceLocker } from '@/components/dashboard/evidence-locker'",
    "import { EvidenceLocker } from '@/components/dashboard/evidence-locker'\nimport { UrlIntelligenceLab } from '@/components/dashboard/url-intelligence'"
  );
}

// Insert component
const target = `<ThreatAnalysisCard scan={scanResult} />`;
const replacement = `<UrlIntelligenceLab scan={scanResult} />
                <ThreatAnalysisCard scan={scanResult} />`;

code = code.replace(target, replacement);

fs.writeFileSync('src/app/page.tsx', code);
