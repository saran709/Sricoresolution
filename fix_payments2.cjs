const fs = require('fs');
let f = fs.readFileSync('src/pages/admin/Payments.tsx', 'utf8');
f = f.replace(/ \|\| p\.status === 'SUCCESS'/g, '');
fs.writeFileSync('src/pages/admin/Payments.tsx', f);
