const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/threat-scanner.tsx', 'utf8');

code = code.replace(
  `onAnalyze(payload, type)`,
  `onAnalyze(payload.trim(), type)`
);

fs.writeFileSync('src/components/dashboard/threat-scanner.tsx', code);
