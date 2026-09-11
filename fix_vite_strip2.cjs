const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace(
  /\/(\<script type=\"module\" src=\"\/@vite\/client\"\>\<\/script\>)\/g/,
  "\'<script type=\"module\" src=\"/@vite/client\"></script>\'"
);

fs.writeFileSync('vite.config.ts', code);
