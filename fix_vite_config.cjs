const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace(/    build: \{\n      rollupOptions: \{\n        output: \{\n          manualChunks\(id\) \{\n[\s\S]*?          \}\n        \}\n      \}\n    \},/m, '');
fs.writeFileSync('vite.config.ts', code);
