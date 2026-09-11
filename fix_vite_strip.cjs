const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

const newPlugin = `
    {
      name: 'html-transform-strip-vite-client',
      enforce: 'post',
      transformIndexHtml(html) {
        // Strip the Vite client script completely to prevent WebSocket errors in the AI Studio environment
        return html.replace(/<script type="module" src="\/@vite\/client"><\/script>/g, '');
      }
    },
`;

code = code.replace(/\{\s*name:\s*'html-transform-suppress-vite-logs'[\s\S]*?\},/, newPlugin);
fs.writeFileSync('vite.config.ts', code);
