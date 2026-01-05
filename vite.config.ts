import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 __dirname 수동 정의
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  // 빌드된 리소스가 상대 경로로 연결되도록 설정 (404 방지 핵심)
  base: './', 
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'), 
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});