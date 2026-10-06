const fs = require('fs');
let code = fs.readFileSync('src/lib/threat-analyzer.ts', 'utf8');

// Update regex
code = code.replace(
  `PHONE_IND: /(\\+91[\\-\\s]?)?[6-9]\\d{9}\\b/g,`,
  `PHONE_IND: /(?:(?:\\+|0{0,2})91[\\s\\-]?)?[6-9]\\d{9}\\b/g,`
);
code = code.replace(
  `TOLL_FREE: /1800\\d{6,7}\\b/g,`,
  `TOLL_FREE: /1800[\\s\\-]?\\d{3}[\\s\\-]?\\d{3,4}\\b/g,`
);
code = code.replace(
  `SHORTCODE: /\\b[A-Z]{2}-[A-Z0-9]{6}\\b/i,`,
  `SHORTCODE: /^[A-Z]{2}-[A-Z0-9]{6}$/i,`
);
code = code.replace(
  `let extractedContact = "Unspecified Origin / Raw Text"`,
  `let extractedContact: string | null = null`
);

code = code.replace(
  `extractedContact === "Unspecified Origin / Raw Text"`,
  `extractedContact === null`
);

code = code.replace(
  `analyzed contact "${"${extractedContact}"}"`,
  `analyzed contact "${"\\${extractedContact || 'Direct User Input'}"}"`
);
code = code.replace(
  `Detected origin "${"${extractedContact}"}" sending link`,
  `Detected origin "${"\\${extractedContact || 'Direct User Input'}"}" sending link`
);

// Node 1 replacement
code = code.replace(
  /journeyNodes\.push\(\{\n\s*id: 'node-1',\n\s*label: extractedContact,\n\s*type: shortcodes\.length > 0 \? 'sms' : \(phones\.length > 0 \? 'phone' : 'sms'\),\n\s*status: threatLevel === 'LOW' \? 'neutral' : \(shortcodes\.length > 0 \? 'warning' : 'flagged'\),\n\s*details: 'Origin Identity',\n\s*stage: 'OBSERVED',\n\s*evidence: \[extractedContact\]\n\s*\}\)/s,
  `journeyNodes.push({
    id: 'node-1',
    label: extractedContact ? extractedContact : 'Direct User Input',
    type: extractedContact ? (shortcodes.length > 0 ? 'sms' : 'phone') : 'terminal',
    status: threatLevel === 'LOW' ? 'neutral' : (extractedContact ? 'warning' : 'neutral'),
    details: extractedContact ? 'Origin Identity' : 'Transmission Vector: Direct Web / Inbound Buffer\\nSender ID: Not Specified',
    stage: 'OBSERVED',
    evidence: extractedContact ? [extractedContact] : []
  })`
);

fs.writeFileSync('src/lib/threat-analyzer.ts', code);
