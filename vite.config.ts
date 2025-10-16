
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'ub-notion PWA',
        short_name: 'ub-notion',
        theme_color: '#0ea5e9',
        background_color: '#0b1220',
        display: 'standalone',
        start_url: '/',
        lang: 'es',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          { urlPattern: ({url}) => url.pathname.startsWith('/api/'), handler: 'NetworkFirst', options: { cacheName: 'api-cache', networkTimeoutSeconds: 5, cacheableResponse: { statuses: [0, 200] } } },
          { urlPattern: ({request}) => ['document','script','style'].includes(request.destination), handler: 'StaleWhileRevalidate', options: { cacheName: 'app-shell' } }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query', '@tanstack/react-query-persist-client', '@tanstack/query-sync-storage-persister'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'vendor-charts': ['recharts']
        }
      }
    }
  }
})
