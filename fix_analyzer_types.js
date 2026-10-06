const fs = require('fs');
let code = fs.readFileSync('src/lib/threat-analyzer.ts', 'utf8');

code = code.replace(
  /extractedContact = shortcodes\[0\]/g,
  'extractedContact = shortcodes[0] as string'
).replace(
  /extractedContact = phones\[0\]/g,
  'extractedContact = phones[0] as string'
).replace(
  /extractedDomain = urls\[0\]/g,
  'extractedDomain = urls[0] as string'
).replace(
  /extractedDomain = ips\[0\]/g,
  'extractedDomain = ips[0] as string'
);

fs.writeFileSync('src/lib/threat-analyzer.ts', code);
