import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// defineConfig is just a type-hinting helper - Vite works fine without it,
// but it gives your editor autocomplete on the config shape.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4's plugin - reads @theme config straight
                    // out of your CSS file (next file we'll touch), no
                    // separate tailwind.config.js needed
  ],
  server: {
    // Anything your React app requests starting with /api gets silently
    // forwarded to Spring on 8080 during dev - the browser thinks it's
    // all same-origin, so no CORS headers needed on your Spring side.
    // This ONLY affects `npm run dev` - production build has no dev
    // server, so you'll handle API base URLs differently at deploy time.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})