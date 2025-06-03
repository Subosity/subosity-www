import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // Enable PWA in development
      },
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'masked-icon.svg',
        'icon-72x72.png',
        'icon-96x96.png',
        'icon-128x128.png',
        'icon-144x144.png',
        'icon-152x152.png',
        'icon-192x192.png',
        'icon-384x384.png',
        'icon-512x512.png',
        'screenshots/desktop.png',
        'screenshots/mobile.png'
      ],
      manifest: {
        name: 'Subosity',
        short_name: 'Subosity',
        description: 'Subscription Management Made Simple',
        theme_color: '#000000',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        icons: [
          {
            src: '/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshots/desktop.png',
            sizes: '1122x623',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Subosity Desktop Dashboard'
          },
          {
            src: '/screenshots/mobile.png',
            sizes: '377x669',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Subosity Mobile Dashboard'
          }
        ]
      },
      workbox: {
        runtimeCaching: [{
          urlPattern: /^https:\/\/subosity\.com\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'subosity-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
            }
          }
        }]
      }
    })
  ],
  build: {
    prerenderRoutes: ['/', '/pricing', '/about']
  }
})