const fs = require('fs');

let f = fs.readFileSync('src/pages/dashboard/roles/CandidateDashboard.tsx', 'utf8');
f = f.replace(/progData\[0\]\.title/g, "(progData[0] as any).title");
fs.writeFileSync('src/pages/dashboard/roles/CandidateDashboard.tsx', f);

