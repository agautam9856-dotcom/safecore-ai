const fs = require('fs');
let code = fs.readFileSync('src/lib/threat-service.ts', 'utf8');

code = code.replace(/\+1 \(555\) 019-2039/g, "Direct User Input");
code = code.replace(/\+18005550199/g, "Direct User Input");

fs.writeFileSync('src/lib/threat-service.ts', code);
