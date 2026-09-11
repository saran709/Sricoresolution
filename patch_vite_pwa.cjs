const fs = require('fs');

let config = fs.readFileSync('vite.config.ts', 'utf8');

if (!config.includes('VitePWA')) {
  config = `import { VitePWA } from 'vite-plugin-pwa';\n` + config;
  
  const pwaPlugin = `
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        id: '/',
        name: 'Sricore Solutions',
        short_name: 'Sricore',
        description: 'Sricore Solutions is a premier technology company.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\\/\\/fonts\\.(googleapis|gstatic)\\.com\\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  `;
  
  config = config.replace('plugins: [react(), tailwindcss()]', `plugins: [react(), tailwindcss(), ${pwaPlugin}]`);
  fs.writeFileSync('vite.config.ts', config);
  console.log('Patched vite.config.ts');
}
