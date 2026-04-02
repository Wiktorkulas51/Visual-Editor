import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        content: 'src/content.js',
      },
      output: {
        entryFileNames: (assetInfo) => {
          return assetInfo.name === 'content' ? 'src/content.js' : 'assets/[name]-[hash].js'
        },
      },
    },
  },
})
