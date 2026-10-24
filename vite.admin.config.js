import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { localDataPlugin } from './vite.data.plugin.js';

// Configuration for Admin Management Portal (Port 5174)
export default defineConfig({
  plugins: [
    react(),
    localDataPlugin(),
    {
      name: 'admin-spa-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (
            req.url &&
            !req.url.startsWith('/@') &&
            !req.url.startsWith('/node_modules') &&
            !req.url.startsWith('/src') &&
            !req.url.startsWith('/public') &&
            !req.url.startsWith('/api') &&
            !req.url.includes('.')
          ) {
            req.url = '/admin.html';
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5174,
    host: true
  },
  build: {
    rollupOptions: {
      input: 'admin.html'
    }
  }
});
