/**
 * Debug panel + fetch instrumentation. On by default in Vite dev only.
 * Set `VITE_ENABLE_DEBUG_PANEL=true` at build time for QA production builds.
 */
export function isDebugEnabled(): boolean {
  if (import.meta.env.DEV) return true
  return import.meta.env.VITE_ENABLE_DEBUG_PANEL === 'true'
}
