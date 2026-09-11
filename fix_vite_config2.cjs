const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

const oldPlugin = "    {\n      name: 'html-transform-suppress-vite-logs',\n      enforce: 'pre',\n      transformIndexHtml(html) {\n        return html.replace(\n          '<head>',\n          '<head>\\n<script>\\n' +\n          'window.__vite_plugin_react_preamble_installed__ = true;\\n' +\n          'const originalConsoleError = window.console.error;\\n' +\n          'window.console.error = function(...args) {\\n' +\n          '  const msg = args.map(String).join(\" \");\\n' +\n          '  if (msg.includes(\"[vite]\")) return;\\n' +\n          '  originalConsoleError.apply(console, args);\\n' +\n          '};\\n' +\n          '</script>'\n        );\n      }\n    },";

const newPlugin = `
    {
      name: 'html-transform-suppress-vite-logs',
      enforce: 'pre',
      transformIndexHtml(html) {
        return {
          html,
          tags: [
            {
              tag: 'script',
              injectTo: 'head-prepend',
              children: \`
                window.__vite_plugin_react_preamble_installed__ = true;
                const originalConsoleError = window.console.error;
                window.console.error = function(...args) {
                  const msg = args.map(String).join(" ");
                  if (msg.includes("[vite]")) return;
                  originalConsoleError.apply(console, args);
                };
              \`
            }
          ]
        };
      }
    },
`;

code = code.replace(oldPlugin, newPlugin);
fs.writeFileSync('vite.config.ts', code);
