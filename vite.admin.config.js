import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration for Admin Management Portal (Port 5174)
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'admin-spa-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // If request has no file extension (SPA route), serve admin.html
          if (req.url && (!req.url.includes('.') || req.url === '/')) {
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
