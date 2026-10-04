import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    laravel({
      input: [
        'resources/css/app.css',
        'resources/js/main.jsx',
      ],
      refresh: true,
    }),
    react(),
    tailwindcss(),
  ],
  build: {
    // Raise warning threshold — some large assets are expected
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Split vendor libs from app code
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-lucide': ['lucide-react'],
        },
      },
    },
    // Compress assets
    assetsInlineLimit: 4096, // inline assets < 4KB as base64
  },
  server: {
    watch: {
      ignored: ['**/storage/framework/views/**'],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
