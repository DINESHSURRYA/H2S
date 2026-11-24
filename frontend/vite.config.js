import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/help-request': 'http://localhost:3000',
      '/grant-help': 'http://localhost:3000',
      '/ngo': 'http://localhost:3000',
      '/volunteer': 'http://localhost:3000',
      '/admin': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
});
