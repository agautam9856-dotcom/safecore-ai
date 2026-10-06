const fs = require('fs');

// Update page.tsx
let pageCode = fs.readFileSync('src/app/page.tsx', 'utf8');
pageCode = pageCode.replace(
  `setScanResult(data)`,
  `setScanResult(data)\n        window.dispatchEvent(new Event('threats-updated'))`
);
fs.writeFileSync('src/app/page.tsx', pageCode);

// Update action-center.tsx
let actionCode = fs.readFileSync('src/components/dashboard/action-center.tsx', 'utf8');
actionCode = actionCode.replace(
  `setToastVisible(true)`,
  `setToastVisible(true)\n      window.dispatchEvent(new Event('threats-updated'))`
);
// "Display a clean toast: 'Threat node synchronized across 24,600+ defense terminals!'"
// It already shows this exact toast.
fs.writeFileSync('src/components/dashboard/action-center.tsx', actionCode);

