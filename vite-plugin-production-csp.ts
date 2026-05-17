import type { Plugin } from 'vite'
import { PRODUCTION_CSP } from './src/lib/security/productionCsp.ts'

/** Injects a strict CSP meta tag into `index.html` for production builds only. */
export function productionCspPlugin(): Plugin {
  return {
    name: 'production-csp',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (ctx.server) return html
        const tag = `<meta http-equiv="Content-Security-Policy" content="${PRODUCTION_CSP}" />`
        return html.replace('<head>', `<head>\n    ${tag}`)
      },
    },
  }
}
