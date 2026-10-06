const fs = require('fs');
let code = fs.readFileSync('src/lib/correlation-engine.ts', 'utf8');

code = code.replace(
  `id: 'd-1', label: '+91 98210-XXXXX', type: 'phone',`,
  `id: 'd-1', label: 'Direct User Input', type: 'terminal',`
);

fs.writeFileSync('src/lib/correlation-engine.ts', code);
