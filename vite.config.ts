import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path'; // <-- 1. Ho aggiunto l'import per 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Gym Companion',
        short_name: 'GymComp',
        description: 'Il tuo personal trainer intelligente, basato su AI.',
        theme_color: '#44403c',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/wger\.de\/api\/v2\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wger-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  // 2. Ho aggiunto questa intera sezione 'resolve'
  resolve: {
    alias: {
      // Questo dice a Vite dove trovare il file corretto per 'jsmediatags'
      'jsmediatags': path.resolve(__dirname, 'node_modules/jsmediatags/dist/jsmediatags.min.js'),
    },
  },
});