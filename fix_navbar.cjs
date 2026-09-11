const fs = require('fs');
let r = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');

r = r.replace(/>\s*Sign In\s*<\/Link>/g, ">Login</Link>");

fs.writeFileSync('src/components/layout/Navbar.tsx', r);
