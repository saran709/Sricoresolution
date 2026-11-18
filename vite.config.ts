import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      entries: ['index.html', 'src/**/*.{ts,tsx}'],
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-router-dom',
        '@tanstack/react-query',
        'react-helmet-async',
        'lucide-react',
        'clsx',
        'tailwind-merge',
        'date-fns',
        'nprogress',
        'recharts',
        'jspdf',
        'jspdf-autotable',
        'zod',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/storage',
      ],
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 650,
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === 'INVALID_ANNOTATION' &&
            warning.id?.includes('node_modules')
          ) {
            return;
          }
          warn(warning);
        },
        output: {
          entryFileNames: 'assets/app-[hash].js',
          chunkFileNames: 'assets/chunk-[hash].js',
          assetFileNames: 'assets/asset-[hash][extname]',
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('/@firebase/firestore') || id.includes('/firebase/firestore')) {
              return 'firebase-firestore';
            }
            if (id.includes('/@firebase/auth') || id.includes('/firebase/auth')) {
              return 'firebase-auth';
            }
            if (id.includes('/firebase/') || id.includes('/@firebase/')) {
              return 'firebase-core';
            }
            if (id.includes('/recharts/') || id.includes('/victory-vendor/') || id.includes('/d3-')) {
              return 'charts-vendor';
            }
            if (id.includes('/jspdf/')) {
              return 'pdf-vendor';
            }
            if (id.includes('/html2canvas/')) {
              return 'canvas-vendor';
            }
            if (id.includes('/lucide-react/')) {
              return 'icons-vendor';
            }
            if (id.includes('/date-fns/')) {
              return 'date-vendor';
            }
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/scheduler/') ||
              id.includes('/react-router')
            ) {
              return 'react-vendor';
            }
            if (id.includes('/@tanstack/')) {
              return 'query-vendor';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
