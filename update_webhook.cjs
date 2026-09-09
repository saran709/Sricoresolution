const fs = require('fs');
let code = fs.readFileSync('src/lib/sheets.ts', 'utf8');

code = code.replace(
  /const WEBHOOK_URL = 'https:\/\/script\.google\.com\/macros\/s\/.*\/exec';/,
  "const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxBPDJT_x9nDnwIfG-4SvIDWbEtRtbq2tKvfbtQ7g1Av7N7jksPZ3OjwhES0LCrakw/exec';"
);

fs.writeFileSync('src/lib/sheets.ts', code);
