const fs = require('fs');
let code = fs.readFileSync('src/components/dashboard/intel-feed.tsx', 'utf8');

code = code.replace(
  `<p className="text-xs font-semibold text-slate-300 truncate pr-2">{r.scam_category}</p>`,
  `<p className="text-xs font-semibold text-slate-300 truncate pr-2">{r.journey_nodes[0]?.type === 'terminal' || !r.journey_nodes[0]?.evidence?.length ? 'Payload: ' + (r.raw_payload.substring(0, 30) + '...') : r.scam_category}</p>`
);

fs.writeFileSync('src/components/dashboard/intel-feed.tsx', code);
