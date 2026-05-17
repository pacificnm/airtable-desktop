import { DEFAULT_THEME_ID, isRegisteredThemeId } from './definitions/index.ts'

const STORAGE_KEY = 'app.themeId.v1'

export function readThemeId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && isRegisteredThemeId(raw)) return raw
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME_ID
}

export function writeThemeId(themeId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, themeId)
  } catch {
    /* ignore */
  }
}
