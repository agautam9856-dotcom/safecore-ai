const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf8');

code = code.replace(
  `const res = await fetch('/api/analyze', {`,
  `const res = await fetch('/api/scan', {`
);

fs.writeFileSync('src/app/page.tsx', code);
