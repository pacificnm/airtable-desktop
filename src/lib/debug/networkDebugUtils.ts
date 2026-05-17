import type { DebugNetworkEntry } from './types.ts'

export type NetworkStatusFilter =
  | 'all'
  | '2xx'
  | '3xx'
  | '4xx'
  | '5xx'
  | 'failed'

export function matchesNetworkFilter(
  entry: DebugNetworkEntry,
  urlQuery: string,
  statusFilter: NetworkStatusFilter,
): boolean {
  const q = urlQuery.trim().toLowerCase()
  if (q && !entry.url.toLowerCase().includes(q)) return false

  if (statusFilter === 'all') return true
  if (statusFilter === 'failed') {
    return Boolean(entry.error) || entry.status == null
  }
  const status = entry.status
  if (status == null) return false
  if (statusFilter === '2xx') return status >= 200 && status < 300
  if (statusFilter === '3xx') return status >= 300 && status < 400
  if (statusFilter === '4xx') return status >= 400 && status < 500
  if (statusFilter === '5xx') return status >= 500
  return true
}

export function filterNetworkEntries(
  items: readonly DebugNetworkEntry[],
  urlQuery: string,
  statusFilter: NetworkStatusFilter,
): DebugNetworkEntry[] {
  return items.filter((e) => matchesNetworkFilter(e, urlQuery, statusFilter))
}

export function formatNetworkEntryForCopy(entry: DebugNetworkEntry): string {
  return JSON.stringify(
    {
      method: entry.method,
      url: entry.url,
      status: entry.status,
      ok: entry.ok,
      durationMs: entry.durationMs,
      error: entry.error,
      timestamp: new Date(entry.timestamp).toISOString(),
      requestId: entry.requestId,
      attempt: entry.attempt,
      rateLimit: entry.rateLimit,
      request: entry.request,
      response: entry.response,
    },
    null,
    2,
  )
}

export function formatHttpPartForCopy(
  title: string,
  part: NonNullable<DebugNetworkEntry['request']>,
): string {
  return JSON.stringify({ [title]: part }, null, 2)
}
