/** In-memory tableKey → tableId index (hydrated from App Config + provisioning). */
let cache: Record<string, string> = {}

export function getModuleTableIdCache(): Readonly<Record<string, string>> {
  return cache
}

export function mergeModuleTableIdCache(partial: Record<string, string>): void {
  cache = { ...cache, ...partial }
}

export function clearModuleTableIdCache(): void {
  cache = {}
}

export function removeTableKeysFromModuleTableIdCache(tableKeys: readonly string[]): void {
  if (tableKeys.length === 0) return
  const next = { ...cache }
  for (const key of tableKeys) {
    delete next[key]
  }
  cache = next
}
