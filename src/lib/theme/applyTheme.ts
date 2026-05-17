import type { AppThemeDefinition } from './types.ts'

export function applyThemeToDocument(definition: AppThemeDefinition): void {
  const root = document.documentElement
  root.setAttribute('data-theme', definition.id)
  root.style.colorScheme = definition.mode

  for (const [key, value] of Object.entries(definition.cssVars)) {
    root.style.setProperty(key, value)
  }
}
