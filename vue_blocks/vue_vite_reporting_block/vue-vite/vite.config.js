import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteExternalsPlugin } from 'vite-plugin-externals'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        entryFileNames: `assets/bundle.js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      },
    }
  },
  plugins: [
    vue(),
    viteExternalsPlugin({
      vue: 'Vue'
    }, { disableInServe: true }),
  ],
})
