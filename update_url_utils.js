const fs = require('fs');
let code = fs.readFileSync('src/lib/url-utils.ts', 'utf8');

const target = `    const isLong = normalized.length > 75`;
const replacement = `    // SSRF / Private IP safety check on domain
    const ipRegex = /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/;
    if (ipRegex.test(domain)) {
      const parts = domain.split('.').map(Number);
      if (
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        parts[0] === 127 ||
        parts[0] === 0 ||
        parts[0] === 169
      ) {
        throw new Error('Private IP addresses are restricted.');
      }
    }
    
    if (domain === 'localhost' || domain.endsWith('.local') || domain.includes('::1')) {
      throw new Error('Local domains are restricted.');
    }

    const isLong = normalized.length > 75`;

code = code.replace(target, replacement);
fs.writeFileSync('src/lib/url-utils.ts', code);
