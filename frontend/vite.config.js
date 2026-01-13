// vite.config.js
import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'] // remove if you don’t need old browsers
    })
  ],
  server: {
    open: true,        // same as Parcel's --open
    port: 3000
  },
  build: {
    target: 'es2015',  // or 'esnext' if you drop legacy plugin
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // This makes URLs work when deployed to subfolder (same as --public-url /)
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  }
})