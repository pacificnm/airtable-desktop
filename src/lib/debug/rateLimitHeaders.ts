import { parseRetryAfterMs } from '../airtable/retryDelay.ts'
import type { DebugRateLimitInfo } from './types.ts'

function headerGet(headers: Headers, name: string): string | undefined {
  const v = headers.get(name)
  return v?.trim() ? v.trim() : undefined
}

export { parseRetryAfterMs }

/** Collect rate-limit related response headers for the debug panel. */
export function extractRateLimitInfo(headers: Headers): DebugRateLimitInfo | undefined {
  const raw: Record<string, string> = {}
  headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (
      lower === 'retry-after' ||
      (lower.includes('rate') && lower.includes('limit'))
    ) {
      raw[key] = value
    }
  })

  if (Object.keys(raw).length === 0) return undefined

  const retryAfterMs = parseRetryAfterMs(headers.get('retry-after'))

  return {
    retryAfterMs,
    limit:
      headerGet(headers, 'x-ratelimit-limit') ??
      headerGet(headers, 'x-airtable-rate-limit-limit'),
    remaining:
      headerGet(headers, 'x-ratelimit-remaining') ??
      headerGet(headers, 'x-airtable-rate-limit-remaining'),
    reset:
      headerGet(headers, 'x-ratelimit-reset') ??
      headerGet(headers, 'x-airtable-rate-limit-reset'),
    raw,
  }
}

export function formatRateLimitSummary(info: DebugRateLimitInfo): string {
  const parts: string[] = []
  if (info.remaining != null && info.limit != null) {
    parts.push(`${info.remaining}/${info.limit}`)
  } else if (info.remaining != null) {
    parts.push(`remaining ${info.remaining}`)
  }
  if (info.retryAfterMs != null) {
    parts.push(`retry ${Math.ceil(info.retryAfterMs / 1000)}s`)
  }
  return parts.join(' · ')
}
