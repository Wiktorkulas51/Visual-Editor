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
        sidepanel: 'sidepanel.html',
        content: 'src/content.js',
        background: 'src/background.js',
      },
      output: {
        entryFileNames: (assetInfo) => {
          if (assetInfo.name === 'content') {
            return 'src/content.js'
          }

          if (assetInfo.name === 'background') {
            return 'src/background.js'
          }

          return 'assets/[name]-[hash].js'
        },
      },
    },
  },
})
