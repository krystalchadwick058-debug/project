// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 保留你原有的 Binance 代理（用于行情/K线）
      '/api/binance': {
        target: 'https://api.binance.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/binance/, ''),
      },
      // 新增：内部员工系统 API
      '/internal': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
    port: 3000,
    open: true,
  },
});