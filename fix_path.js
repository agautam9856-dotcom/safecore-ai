const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/attack-path-replay.tsx', 'utf8');

// Add Terminal to lucide-react imports
code = code.replace(
  `import { PlayCircle, ShieldAlert, Phone, MessageSquare, Link2, Globe, CreditCard, Lock, ChevronRight, CheckCircle, Crosshair, HelpCircle, Activity, Info } from 'lucide-react'`,
  `import { PlayCircle, ShieldAlert, Phone, MessageSquare, Link2, Globe, CreditCard, Lock, ChevronRight, CheckCircle, Crosshair, HelpCircle, Activity, Info, Terminal } from 'lucide-react'`
);

// Add case 'terminal': return <Terminal className="w-5 h-5" />
code = code.replace(
  `case 'otp': return <Lock className="w-5 h-5" />`,
  `case 'otp': return <Lock className="w-5 h-5" />\n    case 'terminal': return <Terminal className="w-5 h-5" />`
);

fs.writeFileSync('src/components/dashboard/attack-path-replay.tsx', code);
