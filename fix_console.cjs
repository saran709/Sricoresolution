const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const script = `
    <script>
      const originalConsoleError = console.error;
      console.error = function(...args) {
        if (typeof args[0] === 'string' && args[0].includes('[vite]')) return;
        originalConsoleError.apply(console, args);
      };
    </script>
`;

if (!html.includes('originalConsoleError')) {
  html = html.replace('<head>', '<head>' + script);
  fs.writeFileSync('index.html', html);
}
