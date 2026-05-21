export type CacheEntryKind = 'schema' | 'list' | 'record' | 'linkedLabels' | 'other'

export interface CacheEntrySnapshot {
  key: string
  kind: CacheEntryKind
  tableId?: string
  expiresAt: number
  expiresInMs: number
  isExpired: boolean
  sizeBytes: number
  summary: string
}

export function parseCacheKey(key: string): { kind: CacheEntryKind; tableId?: string } {
  if (key === 'schema') return { kind: 'schema' }
  const list = /^list:([^:]+):/.exec(key)
  if (list) return { kind: 'list', tableId: list[1] }
  const record = /^record:([^:]+):/.exec(key)
  if (record) return { kind: 'record', tableId: record[1] }
  const linked = /^linkedLabels:([^:]+):/.exec(key)
  if (linked) return { kind: 'linkedLabels', tableId: linked[1] }
  return { kind: 'other' }
}

function byteLength(data: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(data)).length
  } catch {
    return 0
  }
}

function summarizeCachedData(key: string, data: unknown): string {
  const { kind } = parseCacheKey(key)
  if (kind === 'schema' && data && typeof data === 'object' && 'tables' in data) {
    const tables = (data as { tables?: unknown[] }).tables
    return `${Array.isArray(tables) ? tables.length : 0} tables`
  }
  if (kind === 'list' && data && typeof data === 'object' && 'records' in data) {
    const records = (data as { records?: unknown[] }).records
    return `${Array.isArray(records) ? records.length : 0} records`
  }
  if (kind === 'record' && data && typeof data === 'object' && 'id' in data) {
    return String((data as { id?: unknown }).id ?? 'record')
  }
  if (kind === 'linkedLabels' && data && typeof data === 'object') {
    return `${Object.keys(data as object).length} labels`
  }
  return byteLength(data) > 0 ? `${byteLength(data)} bytes` : 'empty'
}

export function buildCacheEntrySnapshot(
  key: string,
  expiresAt: number,
  data: unknown,
  now = Date.now(),
): CacheEntrySnapshot {
  const { kind, tableId } = parseCacheKey(key)
  const isExpired = expiresAt <= now
  return {
    key,
    kind,
    tableId,
    expiresAt,
    expiresInMs: expiresAt - now,
    isExpired,
    sizeBytes: byteLength(data),
    summary: summarizeCachedData(key, data),
  }
}
