import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@react-oauth/google'], // Pre-bundle for faster loading
  },
  build: {
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@headlessui/react', 'framer-motion'],
          'charts-vendor': ['recharts'],
          'auth-vendor': ['@react-oauth/google', 'jwt-decode'],
          'icons-vendor': ['lucide-react'],
        },
      },
    },
    // Enable gzip compression
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Performance optimizations
  esbuild: {
    // Remove console.log in production
    drop: ['console', 'debugger'],
  },
});
