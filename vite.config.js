import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Budget Tracker PWA',
        short_name: 'BudgetApp',
        description: 'Track your budget with voice input and dual themes',
        theme_color: '#FFB6C1',
        background_color: '#FDF5F6',
        icons: [
          {
            src: 'logo_rounded.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
