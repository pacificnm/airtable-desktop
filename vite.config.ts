import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { productionCspPlugin } from './vite-plugin-production-csp.ts'

const rootDir = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(
  readFileSync(join(rootDir, 'package.json'), 'utf8'),
) as { appName?: string; name: string }
const displayAppName =
  typeof pkg.appName === 'string' && pkg.appName.length > 0
    ? pkg.appName
    : pkg.name

// https://vite.dev/config/
export default defineConfig({
  // Electron `loadFile` uses file:// — relative asset URLs are required.
  base: './',
  define: {
    __APP_DISPLAY_NAME__: JSON.stringify(displayAppName),
  },
  plugins: [react(), productionCspPlugin()],
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Plain `vite` dev in the browser: token endpoint is CORS-blocked.
      // In Electron, OAuth token exchange uses `electron/main.ts` instead.
      '/__airtable_oauth': {
        target: 'https://airtable.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/__airtable_oauth/, '/oauth2'),
      },
      // Renderer → Airtable API (avoids CORS on custom debug headers in dev).
      '/__airtable_api': {
        target: 'https://api.airtable.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/__airtable_api/, ''),
      },
    },
  },
})
