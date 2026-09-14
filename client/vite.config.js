import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) {
            return 'vendor-react';
          }
          if (id.includes('react-icons')) return 'vendor-icons';
          if (id.includes('react-markdown') || id.includes('remark') || id.includes('micromark')) {
            return 'vendor-markdown';
          }
          if (id.includes('react-simple-wysiwyg')) return 'vendor-editor';
        },
      },
    },
  },
})
