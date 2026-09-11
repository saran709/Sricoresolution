const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove the script tag that adds window.onerror and unhandledrejection
html = html.replace(/<script>[\s\S]*?window\.onerror[\s\S]*?<\/script>/g, '');

fs.writeFileSync('index.html', html);
