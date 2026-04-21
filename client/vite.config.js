import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI libs
          'vendor-ui': ['lucide-react', 'react-hot-toast', 'framer-motion'],
          // Charts
          'vendor-charts': ['recharts'],
          // HTTP
          'vendor-http': ['axios'],
        },
      },
    },
  },
});
