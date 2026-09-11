const fs = require('fs');
let r = fs.readFileSync('src/lib/firebaseService.ts', 'utf8');

r = r.replace(/} catch\(e\) {\n\s*console\.error\(e\);\n\s*return null;\n\s*}/g, "} catch(e: any) {\n      console.warn('Ignored transient getDoc error:', e.message);\n      return null;\n    }");

fs.writeFileSync('src/lib/firebaseService.ts', r);
