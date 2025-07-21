import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // ... le tue altre opzioni PWA
      workbox: {
        runtimeCaching: [
          {
            // Applica questa regola a tutte le richieste che iniziano con l'URL dell'API di wger
            urlPattern: /^https:\/\/wger\.de\/api\/v2\/.*/,
            
            // ===============================================================
            // SOLUZIONE: Usa la strategia 'NetworkFirst'.
            // Questo forza la richiesta ad andare in rete, risolvendo il bug.
            // ===============================================================
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
          },
          // Qui potrebbero esserci altre regole di caching per il resto della tua app
        ]
      }
    })
  ],
});