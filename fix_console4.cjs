const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newScript = `
    <script>
      const originalConsoleError = window.console.error;
      window.console.error = function(...args) {
        let msg = '';
        try {
          msg = args.map(a => (a instanceof Error ? a.message : (typeof a === 'object' ? JSON.stringify(a) : String(a)))).join(' ');
        } catch(e) {
          msg = String(args[0]);
        }
        if (msg.includes('[vite]') || msg.includes('offline') || msg.includes('Failed to get document')) return;
        originalConsoleError.apply(console, args);
      };
      
      window.addEventListener('unhandledrejection', event => {
         if (event.reason && typeof event.reason.message === 'string' && (event.reason.message.includes('offline') || event.reason.message.includes('Failed to get document'))) {
             event.preventDefault();
         }
      });

      window.addEventListener('error', event => {
         if (event.message && typeof event.message === 'string' && (event.message.includes('offline') || event.message.includes('Failed to get document'))) {
             event.preventDefault();
         }
      });
    </script>
`;

html = html.replace(/<script>\s*const originalConsoleError = window\.console\.error;.*?<\/script>/s, newScript);
fs.writeFileSync('index.html', html);
