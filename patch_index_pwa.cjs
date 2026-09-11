const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const metaTags = `
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Sricore" />
  <link rel="apple-touch-icon" href="/logo.png" />
  <link rel="icon" type="image/png" href="/logo.png" />
`;

if (!html.includes('apple-mobile-web-app-capable')) {
  html = html.replace('</head>', metaTags + '</head>');
  fs.writeFileSync('index.html', html);
  console.log('Patched index.html for PWA');
}
