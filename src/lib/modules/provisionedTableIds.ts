const STORAGE_KEY = 'app.moduleProvisionedTables.v1'

export type ProvisionedTableMap = Record<string, string>

function storageKey(moduleId: string, tableKey: string): string {
  return `${moduleId}:${tableKey}`
}

export function readAllProvisionedTableIds(): ProvisionedTableMap {
  if (typeof localStorage === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    const out: ProvisionedTableMap = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'string' && v.startsWith('tbl')) out[k] = v
    }
    return out
  } catch {
    return {}
  }
}

export function getProvisionedTableId(
  moduleId: string,
  tableKey: string,
): string | undefined {
  return readAllProvisionedTableIds()[storageKey(moduleId, tableKey)]
}

export function setProvisionedTableIds(
  moduleId: string,
  idsByTableKey: Record<string, string>,
): void {
  const all = readAllProvisionedTableIds()
  for (const [tableKey, tableId] of Object.entries(idsByTableKey)) {
    all[storageKey(moduleId, tableKey)] = tableId
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function clearProvisionedTableIdsForModule(moduleId: string): void {
  const all = readAllProvisionedTableIds()
  const prefix = `${moduleId}:`
  for (const key of Object.keys(all)) {
    if (key.startsWith(prefix)) delete all[key]
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}
