const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Insert import if not exists
if (!code.includes('SmartAlertCenter')) {
  code = code.replace(
    "import { ActionCenter } from '@/components/dashboard/action-center'",
    "import { ActionCenter } from '@/components/dashboard/action-center'\nimport { SmartAlertCenter } from '@/components/dashboard/smart-alert-center'"
  );
}

// Insert component
const target = `</main>`;
const replacement = `  <SmartAlertCenter currentScan={scanResult} />\n    </main>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/app/page.tsx', code);
