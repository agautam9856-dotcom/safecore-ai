const fs = require('fs');
const file = 'src/components/dashboard/threat-ticker.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  /"🔴 CRITICAL INTERCEPT: \+91 98210-XXXXX \(SBI KYC Phishing\)"/,
  '"🔴 CRITICAL INTERCEPT: sbi-kyc-gateway.top (Credential Harvesting Phish)"'
);
fs.writeFileSync(file, code);
