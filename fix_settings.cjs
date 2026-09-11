const fs = require('fs');
let f = fs.readFileSync('src/pages/admin/Settings.tsx', 'utf8');
f = f.replace(/record\.id \|\| record\.uid/g, "record.id || (record as any).uid");
fs.writeFileSync('src/pages/admin/Settings.tsx', f);
