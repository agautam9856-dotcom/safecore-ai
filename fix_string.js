const fs = require('fs');
let code = fs.readFileSync('src/lib/threat-analyzer.ts', 'utf8');

code = code.replace(/contact "\$\{extractedContact\}"/g, 'contact "${extractedContact || \'Direct User Input\'}"');

fs.writeFileSync('src/lib/threat-analyzer.ts', code);
