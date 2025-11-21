import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://be.dungmetri.io.vn',
        changeOrigin: true,
        secure: false
      }
    },
    historyApiFallback: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['dungmetri.io.vn', '20.2.232.7', 'localhost'],
    proxy: {
      '/api': {
        target: 'https://be.dungmetri.io.vn',
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['sockjs-client', '@stomp/stompjs']
  }
})