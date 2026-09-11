const fs = require('fs');

let f = fs.readFileSync('src/pages/admin/Payments.tsx', 'utf8');
f = f.replace(/p\.status === 'COMPLETED'/g, "p.status === 'SUCCESS'");
f = f.replace(/p\.status === 'CREATED'/g, "p.status === 'INITIATED'");
f = f.replace(/p\.type ===/g, "(p as any).type ===");
fs.writeFileSync('src/pages/admin/Payments.tsx', f);
