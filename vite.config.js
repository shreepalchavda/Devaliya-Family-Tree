import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { localDataPlugin } from './vite.data.plugin.js';

// Configuration for Family Directory & Admin Portal
export default defineConfig({
  plugins: [react(), localDataPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin.html')
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
