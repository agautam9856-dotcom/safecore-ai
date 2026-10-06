const fs = require('fs');
let code = fs.readFileSync('src/app/api/scan/route.ts', 'utf8');

code = code.replace(/@\/lib\/dynamic-engine/g, '@/lib/threat-analyzer');
code = code.replace(/parsePayloadDynamically/g, 'analyzePayload');

fs.writeFileSync('src/app/api/scan/route.ts', code);
