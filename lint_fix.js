const fs = require('fs');

function replaceFile(path, target, replacement) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
  }
}

// src/app/safety-profile/page.tsx
replaceFile('src/app/safety-profile/page.tsx', 
  "import { ShieldCheck, ShieldAlert, AlertTriangle, Activity, Database, HelpCircle, Eye, ArrowRight, Shield } from 'lucide-react'",
  "import { ShieldCheck, ShieldAlert, Activity, Database, ArrowRight, Shield } from 'lucide-react'");
replaceFile('src/app/safety-profile/page.tsx', 
  "import { playCyberClick, playCyberScan } from '@/lib/audio'",
  "import { playCyberClick } from '@/lib/audio'");
replaceFile('src/app/safety-profile/page.tsx',
  "import { motion, AnimatePresence } from 'framer-motion'",
  "import { motion } from 'framer-motion'");

// src/components/dashboard/attack-path-replay.tsx
replaceFile('src/components/dashboard/attack-path-replay.tsx',
  "import { ScanRecord, AttackPathNode, NextMovePrediction } from '@/types/threat'",
  "import { ScanRecord, AttackPathNode } from '@/types/threat'");
replaceFile('src/components/dashboard/attack-path-replay.tsx',
  "import { useState, useEffect, useRef } from 'react'",
  "import { useState, useRef } from 'react'");
replaceFile('src/components/dashboard/attack-path-replay.tsx',
  "import { AlertTriangle, Activity, Database, Link as LinkIcon, Crosshair, Map, ChevronRight } from 'lucide-react'",
  "import { AlertTriangle, Activity, Database, Link as LinkIcon, Crosshair, Map } from 'lucide-react'");

// src/components/dashboard/evidence-locker.tsx
replaceFile('src/components/dashboard/evidence-locker.tsx',
  "import { Fingerprint, Clock, ExternalLink, ShieldAlert, Activity, Server, FileDigit, Database, ArrowRight, Shield, Eye } from 'lucide-react'",
  "import { Fingerprint, Clock, ExternalLink, ShieldAlert, Activity, Server, FileDigit, Database, Shield } from 'lucide-react'");

// src/components/dashboard/smart-alert-center.tsx
replaceFile('src/components/dashboard/smart-alert-center.tsx',
  "import { Bell, ShieldAlert, AlertTriangle, X, ChevronRight, CheckCircle, Database, Eye, EyeOff } from 'lucide-react'",
  "import { Bell, AlertTriangle, X, CheckCircle, Database } from 'lucide-react'");

// src/components/dashboard/threat-memory.tsx
replaceFile('src/components/dashboard/threat-memory.tsx',
  "import { motion, AnimatePresence } from 'framer-motion'",
  "import { motion } from 'framer-motion'");

// src/components/dashboard/url-intelligence.tsx
replaceFile('src/components/dashboard/url-intelligence.tsx',
  "import { motion, AnimatePresence } from 'framer-motion'",
  "");
replaceFile('src/components/dashboard/url-intelligence.tsx',
  "import { ShieldAlert, Globe, Server, Link2, AlertTriangle, CheckCircle, Activity, ExternalLink, Shield, Database, Eye } from 'lucide-react'",
  "import { Globe, Server, Link2, AlertTriangle, CheckCircle, Activity, ExternalLink, Shield, Database } from 'lucide-react'");

// src/lib/insights-engine.ts
replaceFile('src/lib/insights-engine.ts',
  "import { SecurityInsights, TrendAnalysis, TimelineEvent, TimelineEventType, TrendDirection } from '@/types/insights'",
  "import { SecurityInsights, TrendAnalysis, TimelineEvent, TrendDirection } from '@/types/insights'");

// src/types/insights.ts
replaceFile('src/types/insights.ts',
  "import { ScanRecord } from './threat'",
  "");

// src/types/profile.ts
replaceFile('src/types/profile.ts',
  "import { ScanRecord } from './threat'",
  "");
replaceFile('src/types/profile.ts',
  "import { SmartAlert } from './alert'",
  "");
