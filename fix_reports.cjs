const fs = require('fs');
let r = fs.readFileSync('src/pages/admin/Reports.tsx', 'utf8');

r = r.replace(/row\[header\]/g, 'row[header as string]');
fs.writeFileSync('src/pages/admin/Reports.tsx', r);
