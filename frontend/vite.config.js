import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: true,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/scan': 'http://localhost:8000',
      '/scans': 'http://localhost:8000',
      '/reports': 'http://localhost:8000',
      '/explain': 'http://localhost:8000',
      '/org': 'http://localhost:8000',
    },
  },
  preview: {
    proxy: {
      '/auth': 'http://localhost:8000',
      '/scan': 'http://localhost:8000',
      '/scans': 'http://localhost:8000',
      '/reports': 'http://localhost:8000',
      '/explain': 'http://localhost:8000',
      '/org': 'http://localhost:8000',
    },
  },
})
