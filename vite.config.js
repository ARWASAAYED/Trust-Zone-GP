import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://trustzone.azurewebsites.net',
        changeOrigin: true,
        // Remove rewrite to keep /api prefix
        configure: (proxy, options) => {
          console.log('Proxy configured for:', options.target);
        },
      },
    },
  },
})