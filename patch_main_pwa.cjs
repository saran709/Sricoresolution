const fs = require('fs');

let content = fs.readFileSync('src/main.tsx', 'utf8');

if (!content.includes('virtual:pwa-register')) {
  const pwaImport = `import { registerSW } from 'virtual:pwa-register';\nregisterSW({ immediate: true });\n`;
  content = content.replace("import './index.css';", "import './index.css';\n" + pwaImport);
  fs.writeFileSync('src/main.tsx', content);
  console.log('Patched main.tsx with registerSW');
}
