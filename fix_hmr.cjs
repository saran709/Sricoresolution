const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /server:\s*\{\s*middlewareMode:\s*true\s*\}/,
  "server: { middlewareMode: true, hmr: false }"
);
fs.writeFileSync('server.ts', code);
