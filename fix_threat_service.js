const fs = require('fs');
let code = fs.readFileSync('src/lib/threat-service.ts', 'utf8');

const getBaseUrl = `const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return \`https://\${process.env.VERCEL_URL}\`
  return 'http://localhost:3000'
}`;

code = getBaseUrl + '\n\n' + code;

code = code.replace(/fetch\('\/api\/threats/g, "fetch(`${getBaseUrl()}/api/threats");

fs.writeFileSync('src/lib/threat-service.ts', code);
