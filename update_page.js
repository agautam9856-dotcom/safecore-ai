const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Insert import if not exists
if (!code.includes('EvidenceLocker')) {
  code = code.replace(
    "import { ActionCenter } from '@/components/dashboard/action-center'",
    "import { ActionCenter } from '@/components/dashboard/action-center'\nimport { EvidenceLocker } from '@/components/dashboard/evidence-locker'"
  );
}

// Insert component
const target = `<ActionCenter scan={scanResult} />`;
const replacement = `<ActionCenter scan={scanResult} />
                <EvidenceLocker scan={scanResult} />`;

code = code.replace(target, replacement);

fs.writeFileSync('src/app/page.tsx', code);
