import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  return {
    plugins: [react(),tailwindcss()],
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
