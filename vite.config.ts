import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    plugins: [
      react(),
      VitePWA({
        strategies: 'generateSW', // tự sinh SW, tránh lỗi injectManifest khi chưa có sw.js
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        devOptions: { enabled: true },
        manifest: {
          name: 'Family Finance',
          short_name: 'Finance',
          description: 'Quản lý chi tiêu gia đình',
          theme_color: '#0ea5e9',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  }
});
