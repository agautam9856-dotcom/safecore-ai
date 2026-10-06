const fs = require('fs');
let code = fs.readFileSync('src/types/threat.ts', 'utf8');

code = code.replace(
  `type: 'phone' | 'sms' | 'url' | 'website' | 'payment' | 'otp'`,
  `type: 'phone' | 'sms' | 'url' | 'website' | 'payment' | 'otp' | 'terminal'`
);

fs.writeFileSync('src/types/threat.ts', code);
