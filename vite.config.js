import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const demo = (p) => fileURLToPath(new URL(`./src/demo/${p}`, import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // `vite build --mode demo` swaps Firebase for an in-browser fake with sample data
  base: mode === 'demo' ? './' : '/',
  resolve: {
    alias:
      mode === 'demo'
        ? {
            'firebase/app': demo('app.js'),
            'firebase/auth': demo('auth.js'),
            'firebase/firestore': demo('firestore.js'),
          }
        : {},
  },
  build: {
    outDir: mode === 'demo' ? 'dist-demo' : 'dist',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: mode === 'demo' ? { codeSplitting: false } : {
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase';
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'charts';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
  test: {
    environment: 'node',
  },
}));
