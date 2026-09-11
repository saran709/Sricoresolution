const fs = require('fs');
let r = fs.readFileSync('src/pages/auth/Setup.tsx', 'utf8');

r = r.replace(/console\.error\("Error checking setup:", err\);/g, "console.warn('Error checking setup:', err);");

fs.writeFileSync('src/pages/auth/Setup.tsx', r);
