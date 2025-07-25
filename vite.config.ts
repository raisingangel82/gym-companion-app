import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // Sezione manifest aggiunta/aggiornata
      manifest: {
        name: 'Gym Companion',
        short_name: 'GymComp',
        description: 'Il tuo personal trainer intelligente, basato su AI.',
        theme_color: '#44403c', // Esempio (Grigio Pietra), puoi scegliere il colore che preferisci
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo.png', // Il file che hai messo in /public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png', // Il file che hai messo in /public
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
                maxAgeSeconds: 60 * 60 * 24 // Cache per 24 ore
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
});