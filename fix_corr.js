const fs = require('fs');
let code = fs.readFileSync('src/types/correlation.ts', 'utf8');

code = code.replace(
  `type: 'phone' | 'sms' | 'email' | 'url' | 'domain' | 'website' | 'payment' | 'otp'`,
  `type: 'phone' | 'sms' | 'email' | 'url' | 'domain' | 'website' | 'payment' | 'otp' | 'terminal'`
);

fs.writeFileSync('src/types/correlation.ts', code);
