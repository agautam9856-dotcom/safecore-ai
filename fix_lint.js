const fs = require('fs');
let code = fs.readFileSync('src/lib/threat-analyzer.ts', 'utf8');

code = code.replace(/import \{ ScanRecord, NextMovePrediction, JourneyNode, RiskLevel \} from '@\/types\/threat'/, "import { ScanRecord, NextMovePrediction, JourneyNode, RiskLevel, ScanType } from '@/types/threat'");

code = code.replace(/export function analyzePayload\(payload: string, type: 'message' \| 'url' \| 'email' \| 'qr' = 'message'\)/, "export function analyzePayload(payload: string, type: ScanType = 'message')");

code = code.replace(/scan_type: type as any,/, "scan_type: type,");

// Remove unused statusText
code = code.replace(/let statusText = 'VERIFIED BENIGN \/ LOW RISK'/g, "");
code = code.replace(/statusText = 'CRITICAL COMPROMISE VECTOR'/g, "");
code = code.replace(/statusText = 'ELEVATED SUSPICION'/g, "");

fs.writeFileSync('src/lib/threat-analyzer.ts', code);
