const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

code = code.replace('{!loading && children}', '{children}');

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
