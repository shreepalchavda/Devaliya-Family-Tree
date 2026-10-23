import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration for Public Family Directory (Port 5173)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
