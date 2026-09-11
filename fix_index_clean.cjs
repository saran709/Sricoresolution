const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove the old injected script chunk
html = html.replace(/<script>\s*const originalConsoleLog = window\.console\.log;[\s\S]*?<\/script>/, '');

fs.writeFileSync('index.html', html);
