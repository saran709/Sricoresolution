const fs = require('fs');
let r = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

r = r.replace(/} catch\(e\) { console\.error\(e\); }/g, "} catch(e) { console.warn('Ignored transient getDoc error:', e.message); }");
r = r.replace(/console\.error\("Error fetching user profile:", error\);/g, "console.warn('Error fetching user profile:', error.message);");

fs.writeFileSync('src/contexts/AuthContext.tsx', r);
