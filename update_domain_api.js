const fs = require('fs');
let code = fs.readFileSync('src/app/api/domain-intel/route.ts', 'utf8');

const target = `const lowerDomain = domain.toLowerCase()
    if (lowerDomain === 'localhost' || lowerDomain.includes('127.0.0.1') || lowerDomain.includes('.local')) {`;

const replacement = `const lowerDomain = domain.toLowerCase()
    const forbidden = ['localhost', '127.0.0.1', '0.0.0.0', '10.', '172.16.', '192.168.', '169.254.', '::1', '.local']
    if (forbidden.some(f => lowerDomain.includes(f))) {`;

code = code.replace(target, replacement);
fs.writeFileSync('src/app/api/domain-intel/route.ts', code);
