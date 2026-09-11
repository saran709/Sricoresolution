const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

// Force HMR to false globally so vite-plugin-react and vite core know it's off
code = code.replace(/hmr:\s*process\.env\.DISABLE_HMR\s*!==\s*'true'/, 'hmr: false');
fs.writeFileSync('vite.config.ts', code);
