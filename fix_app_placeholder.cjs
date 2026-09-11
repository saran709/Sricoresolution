const fs = require('fs');
let r = fs.readFileSync('src/router.tsx', 'utf8');
r = r.replace(/<Route path="finance\/receipts".*?\/>/g, '');
r = r.replace(/<Route path="finance\/refunds".*?\/>/g, '');
fs.writeFileSync('src/router.tsx', r);
