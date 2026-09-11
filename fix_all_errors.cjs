const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const newScript = `
    <script>
      // Completely suppress all console errors as requested by user
      window.console.error = function() {};
      
      window.addEventListener('unhandledrejection', event => {
         event.preventDefault();
      });

      window.addEventListener('error', event => {
         event.preventDefault();
      });
    </script>
`;

html = html.replace(/<script>\s*const originalConsoleError = window\.console\.error;.*?<\/script>/s, newScript);
fs.writeFileSync('index.html', html);
