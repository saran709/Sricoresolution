const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

const pluginCode = `
    {
      name: 'html-transform-suppress-vite-logs',
      enforce: 'pre',
      transformIndexHtml(html) {
        return html.replace(
          '<head>',
          '<head>\\n<script>\\n' +
          'window.__vite_plugin_react_preamble_installed__ = true;\\n' +
          'const originalConsoleError = window.console.error;\\n' +
          'window.console.error = function(...args) {\\n' +
          '  const msg = args.map(String).join(" ");\\n' +
          '  if (msg.includes("[vite]")) return;\\n' +
          '  originalConsoleError.apply(console, args);\\n' +
          '};\\n' +
          '</script>'
        );
      }
    },
`;

code = code.replace('plugins: [react(), tailwindcss(),', 'plugins: [react(), tailwindcss(),' + pluginCode);
fs.writeFileSync('vite.config.ts', code);
