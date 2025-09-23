import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/apis', import.meta.url)),
    },
  },
  assetsInclude: ['**/*.atlas', '**/*.skel', '**/*.webp', '**/*.png', '**/*.mp3'],
  server: {
    host: '0.0.0.0', // 允許外部設備訪問
    port: 5173,
    fs: {
      allow: ['..']
    }
  },
  build: {
    assetsInlineLimit: 0 // 不內聯任何資源，都作為獨立文件處理
  }
})
