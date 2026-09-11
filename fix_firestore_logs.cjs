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
        if (msg.includes('@firebase/firestore')) return;
        if (msg.includes('Cloud Firestore backend')) return;
        if (msg.includes('code=unavailable')) return;
        if (msg.includes('healthy Internet connection')) return;
        if (msg.includes('offline mode')) return;
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

html = html.replace(/<script>\s*const originalConsoleLog = window\.console\.log;.*?<\/script>/s, newScript);
fs.writeFileSync('index.html', html);
