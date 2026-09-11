const fs = require('fs');
let r = fs.readFileSync('src/router.tsx', 'utf8');

r = r.replace(/} \/>/g, ''); // Fix stray closing brackets from previous replace
fs.writeFileSync('src/router.tsx', r);
