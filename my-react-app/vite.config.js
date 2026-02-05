import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ✅ Cấu hình đầy đủ, chỉ định rõ file PostCSS
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs', // 👈 ép Vite dùng file postcss đúng
  },
});
