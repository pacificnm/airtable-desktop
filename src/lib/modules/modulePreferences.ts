import { enabledModuleIds as builtInEnabledModuleIds } from '../../config/enabledModules.ts'

const STORAGE_KEY = 'app.enabledModules.v1'

export function readModuleOverrideIds(): readonly string[] | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    return parsed.filter(
      (id): id is string => typeof id === 'string' && id.trim().length > 0,
    )
  } catch {
    return null
  }
}

export function writeModuleOverrideIds(ids: readonly string[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...new Set(ids.map((id) => id.trim()).filter(Boolean))]),
  )
}

export function clearModuleOverrideIds(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasModuleOverride(): boolean {
  return readModuleOverrideIds() !== null
}

export function getBuiltInEnabledModuleIds(): readonly string[] {
  return [...builtInEnabledModuleIds]
}

/** Effective list: local override (Developer → Modules) or `enabledModules.ts`. */
export function getEffectiveEnabledModuleIds(): readonly string[] {
  const override = readModuleOverrideIds()
  if (override !== null && override.length > 0) return override
  return getBuiltInEnabledModuleIds()
}

export function enableModule(moduleId: string): readonly string[] {
  const next = new Set(getEffectiveEnabledModuleIds())
  next.add(moduleId)
  const ids = [...next]
  writeModuleOverrideIds(ids)
  return ids
}

export function disableModule(moduleId: string): readonly string[] {
  const ids = getEffectiveEnabledModuleIds().filter((id) => id !== moduleId)
  writeModuleOverrideIds(ids)
  return ids
}

export function formatEnabledModulesFile(ids: readonly string[]): string {
  const quoted = ids.map((id) => `'${id.replace(/'/g, "\\'")}'`).join(', ')
  return `/**
 * Module ids to load at startup (modules/<id>/ or module-repos/<id>/).
 * Updated via Developer → Modules or edit manually.
 */
export const enabledModuleIds = [${quoted}] as const satisfies readonly string[]

`
}
