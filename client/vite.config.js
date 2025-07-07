import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // server: {
    //   proxy: {
    //     '/api': {
    //       target: "https://to-do-board-qhs5.onrender.com",
    //       changeOrigin: true,
    //     },
    //   },
    // },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
