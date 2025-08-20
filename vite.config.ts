import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Burn Wizard',
        short_name: 'BurnWizard',
        description: 'Clinical tool for burn assessment and fluid management',
        theme_color: '#0f766e', /* Updated to match our teal theme */
        background_color: '#fffbf5', /* Soft cream background */
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Clinical-grade offline patterns for 30+ minute reliability
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot}',
          '**/domain/**/*.{js,ts}', // Critical medical calculation modules
          '**/constants/**/*.{js,ts}' // Clinical reference data
        ],
        // Increased cache size for clinical reliability
        maximumFileSizeToCacheInBytes: 10000000, // 10MB for comprehensive medical assets
        // Aggressive caching strategy for clinical use
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          // Font files
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          // App shell - critical for offline clinical use
          {
            urlPattern: /^https:\/\/.*\/(index\.html|manifest\.json)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-shell-cache'
            }
          },
          // Static resources - domain logic and constants
          {
            urlPattern: /\.(js|css|png|jpg|svg|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          // API calls (if any) - offline-first for calculations
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          // Medical calculation modules - critical for offline clinical use
          {
            urlPattern: /\/(domain|constants)\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'medical-modules-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days for clinical stability
              }
            }
          },
          // Application shell components - essential for offline functionality
          {
            urlPattern: /\/components\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-components-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app/src'),
    },
  },
  root: './app',
  publicDir: './public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
  },
});