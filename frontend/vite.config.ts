import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de Vite con proxy hacia la API en desarrollo
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
});
