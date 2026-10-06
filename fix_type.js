const fs = require('fs');
let code = fs.readFileSync('src/lib/dynamic-engine.ts', 'utf8');

code = code.replace(
  `export function parsePayloadDynamically(text: string, type: 'message' | 'url' | 'email' = 'message'): Omit<ScanRecord, 'id' | 'created_at'> {`,
  `import { ScanType } from '@/types/threat';\nexport function parsePayloadDynamically(text: string, type: ScanType = 'message'): Omit<ScanRecord, 'id' | 'created_at'> {`
);

fs.writeFileSync('src/lib/dynamic-engine.ts', code);
