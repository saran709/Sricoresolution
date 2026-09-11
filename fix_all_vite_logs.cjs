const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newScript = `
    <script>
      const originalConsoleLog = window.console.log;
      const originalConsoleWarn = window.console.warn;
      const originalConsoleError = window.console.error;

      window.console.log = function(...args) {
        const msg = args.map(String).join(' ');
        if (msg.includes('[vite]')) return;
        originalConsoleLog.apply(console, args);
      };

      window.console.warn = function(...args) {
        const msg = args.map(String).join(' ');
        if (msg.includes('[vite]')) return;
        originalConsoleWarn.apply(console, args);
      };

      window.console.error = function(...args) {
        const msg = args.map(String).join(' ');
        if (msg.includes('[vite]')) return;
        // The user previously wanted all errors suppressed.
        // We will just return to hide all errors.
        return; 
      };

      window.addEventListener('unhandledrejection', event => {
         event.preventDefault();
      });

      window.addEventListener('error', event => {
         event.preventDefault();
      });
    </script>
`;

html = html.replace(/<script>\s*\/\/ Completely suppress all console errors as requested by user.*?<\/script>/s, newScript);
fs.writeFileSync('index.html', html);
