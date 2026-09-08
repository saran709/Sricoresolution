const fs = require('fs');
let code = fs.readFileSync('src/pages/About.tsx', 'utf8');
code = code.replace(/<Link[\s\n]*to="\/contact"/g, '<Link to="/tell-us-your-problem"');
fs.writeFileSync('src/pages/About.tsx', code);
