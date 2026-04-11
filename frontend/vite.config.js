import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      /** Cùng origin với Vite để SCO trong iframe truy cập window.API ở parent */
      '/scorm-content': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
