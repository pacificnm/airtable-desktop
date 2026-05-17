const CLEAR_ON_NAVIGATE_KEY = 'debug.clearOnNavigate'

export function readClearOnNavigate(): boolean {
  try {
    return localStorage.getItem(CLEAR_ON_NAVIGATE_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeClearOnNavigate(enabled: boolean): void {
  try {
    localStorage.setItem(CLEAR_ON_NAVIGATE_KEY, enabled ? 'true' : 'false')
  } catch {
    /* ignore */
  }
}
