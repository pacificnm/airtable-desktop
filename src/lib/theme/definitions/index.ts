import type { AppThemeDefinition } from '../types.ts'

export type { AppThemeDefinition } from '../types.ts'
import { darkTheme } from './dark.ts'
import { lightTheme } from './light.ts'

export const DEFAULT_THEME_ID = 'light'

/** Register custom themes here (import from `./myTheme.ts`, etc.). */
export const appThemes: readonly AppThemeDefinition[] = [
  lightTheme,
  darkTheme,
]

const byId = new Map(appThemes.map((t) => [t.id, t]))

export function getThemeDefinition(id: string): AppThemeDefinition {
  return byId.get(id) ?? lightTheme
}

export function isRegisteredThemeId(id: string): boolean {
  return byId.has(id)
}
