import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'https://ideal-lamp-4x7r5vxjv56fx74-8080.app.github.dev',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
