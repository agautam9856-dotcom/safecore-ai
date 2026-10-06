const fs = require('fs');
let code = fs.readFileSync('src/lib/threat-service.ts', 'utf8');

// The replacement made it: fetch(`${getBaseUrl()}/api/threats/scans',
// We need to fix the trailing quote.
code = code.replace(/api\/threats\/scans',/g, "api/threats/scans\`,");
code = code.replace(/api\/threats\/community',/g, "api/threats/community\`,");

fs.writeFileSync('src/lib/threat-service.ts', code);
