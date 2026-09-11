const fs = require('fs');
let r = fs.readFileSync('src/pages/dashboard/roles/InternDashboard.tsx', 'utf8');

r = r.replace(/} catch\(e\) { console\.error\(e\); }/g, "} catch(e: any) { console.warn('Ignored transient getDoc error:', e.message); }");

fs.writeFileSync('src/pages/dashboard/roles/InternDashboard.tsx', r);
