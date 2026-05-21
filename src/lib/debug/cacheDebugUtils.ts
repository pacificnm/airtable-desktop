import type { Query, QueryClient } from '@tanstack/react-query'
import type { CacheEntryKind } from '../airtable/cache/cacheEntrySnapshot.ts'

export interface ReactQueryCacheRow {
  queryHash: string
  queryKey: string
  status: string
  dataUpdatedAt: number
  isStale: boolean
  summary: string
}

export function formatExpiresIn(ms: number): string {
  if (ms <= 0) return 'expired'
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ${sec % 60}s`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ${min % 60}m`
  const day = Math.floor(hr / 24)
  return `${day}d ${hr % 24}h`
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

export function kindLabel(kind: CacheEntryKind): string {
  switch (kind) {
    case 'schema':
      return 'Schema'
    case 'list':
      return 'List'
    case 'record':
      return 'Record'
    case 'linkedLabels':
      return 'Labels'
    default:
      return 'Other'
  }
}

function summarizeQueryData(data: unknown): string {
  if (data == null) return 'no data'
  if (Array.isArray(data)) return `${data.length} items`
  if (typeof data === 'object') {
    if ('records' in data && Array.isArray((data as { records: unknown[] }).records)) {
      return `${(data as { records: unknown[] }).records.length} records`
    }
    if ('rows' in data && Array.isArray((data as { rows: unknown[] }).rows)) {
      return `${(data as { rows: unknown[] }).rows.length} rows`
    }
  }
  try {
    const len = JSON.stringify(data).length
    return formatBytes(len)
  } catch {
    return 'cached'
  }
}

const DEFAULT_JSON_DISPLAY_MAX = 80_000

export function formatCacheJson(
  data: unknown,
  maxDisplay = DEFAULT_JSON_DISPLAY_MAX,
): { text: string; truncated: boolean; totalChars: number } {
  let full: string
  try {
    full = JSON.stringify(data, null, 2) ?? 'null'
  } catch {
    full = String(data)
  }
  const totalChars = full.length
  if (totalChars <= maxDisplay) {
    return { text: full, truncated: false, totalChars }
  }
  return {
    text: `${full.slice(0, maxDisplay)}\n\n…`,
    truncated: true,
    totalChars,
  }
}

export function getReactQueryCacheData(
  client: QueryClient,
  queryHash: string,
): unknown {
  const query = client
    .getQueryCache()
    .getAll()
    .find((q) => q.queryHash === queryHash)
  if (!query) return undefined
  return {
    status: query.state.status,
    fetchStatus: query.state.fetchStatus,
    dataUpdatedAt: query.state.dataUpdatedAt,
    error: query.state.error,
    data: query.state.data,
  }
}

export function snapshotReactQueryCache(client: QueryClient): ReactQueryCacheRow[] {
  return client
    .getQueryCache()
    .getAll()
    .map((query: Query) => ({
      queryHash: query.queryHash,
      queryKey: JSON.stringify(query.queryKey),
      status: query.state.status,
      dataUpdatedAt: query.state.dataUpdatedAt,
      isStale: query.isStale(),
      summary: summarizeQueryData(query.state.data),
    }))
    .sort((a, b) => b.dataUpdatedAt - a.dataUpdatedAt)
}
