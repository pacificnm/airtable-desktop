import { app } from 'electron'

/**
 * Main-process debug features (menu items, DevTools, optional CSP relax).
 * Align with renderer `isDebugEnabled()` — use `AIRTABLE_DEBUG=1` or dev server.
 */
export function isElectronDebugEnabled(): boolean {
  const flag = process.env.AIRTABLE_DEBUG?.toLowerCase()
  if (flag === '1' || flag === 'true') return true
  if (flag === '0' || flag === 'false') return false
  if (!app.isPackaged && Boolean(process.env.VITE_DEV_SERVER_URL)) return true
  return process.env.VITE_ENABLE_DEBUG_PANEL === 'true'
}

export function useStrictContentSecurityPolicy(): boolean {
  return !process.env.VITE_DEV_SERVER_URL
}
