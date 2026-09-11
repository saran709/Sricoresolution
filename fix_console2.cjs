const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newScript = `
    <script>
      const originalConsoleError = window.console.error;
      window.console.error = function(...args) {
        const msg = args.join(' ');
        if (msg.includes('[vite]') || msg.includes('Failed to get document because the client is offline')) return;
        originalConsoleError.apply(console, args);
      };
    </script>
`;

html = html.replace(/<script>\s*const originalConsoleError = console\.error;.*?<\/script>/s, newScript);
fs.writeFileSync('index.html', html);
