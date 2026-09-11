const fs = require('fs');

let config = fs.readFileSync('tsconfig.json', 'utf8');

if (!config.includes('vite-plugin-pwa/client')) {
  // If it has types, we append, if not we add types
  if (config.includes('"types":')) {
    config = config.replace(/"types": \[([^\]]*)\]/, (match, p1) => {
      if (p1.trim().length === 0) {
        return `"types": ["vite-plugin-pwa/client"]`;
      }
      return `"types": [${p1}, "vite-plugin-pwa/client"]`;
    });
  } else {
    config = config.replace('"compilerOptions": {', '"compilerOptions": {\n    "types": ["vite/client", "vite-plugin-pwa/client"],');
  }
  fs.writeFileSync('tsconfig.json', config);
  console.log('Patched tsconfig.json');
}
