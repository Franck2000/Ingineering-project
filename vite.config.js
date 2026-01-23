import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/wazuh': {
        target:'https://10.10.0.154:55000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/wazuh/, ''),
      }
    }
  }
})
