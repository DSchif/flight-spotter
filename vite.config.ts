import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api/routes': {
        target: 'https://opensky-network.org/api/routes/flight',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/routes/, ''),
      },
    },
  },
})
