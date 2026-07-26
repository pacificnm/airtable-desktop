/**
 * Content-Security-Policy for packaged / production renderer builds.
 * Injected into `index.html` at build time and reinforced in Electron `main`.
 */
export const PRODUCTION_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://api.airtable.com https://content.airtable.com https://airtable.com https://*.airtableusercontent.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join('; ')
