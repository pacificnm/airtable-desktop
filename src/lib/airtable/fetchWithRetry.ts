import {
  CLIENT_REQUEST_ATTEMPT_HEADER,
  CLIENT_REQUEST_ID_HEADER,
  createRequestId,
} from './requestId.ts'

export { createRequestId } from './requestId.ts'
import { parseRetryAfterMs } from './retryDelay.ts'

const RETRYABLE_STATUS = new Set([429, 503])
const DEFAULT_MAX_RETRIES = 3

export interface FetchWithRetryOptions {
  /** Logical request id (shared across retries). */
  requestId?: string
  /** Extra attempts after the first (default 3 → up to 4 tries). */
  maxRetries?: number
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function retryDelayMs(res: Response, attempt: number): number {
  const fromHeader = parseRetryAfterMs(res.headers.get('retry-after'))
  if (fromHeader != null) return fromHeader

  if (res.status === 429) {
    return Math.min(30_000, 1000 * 2 ** attempt)
  }
  return Math.min(10_000, 500 * 2 ** attempt)
}

/** Custom headers are only safe on same-origin requests (e.g. Vite dev proxy). */
export function allowsClientDebugHeaders(url: string): boolean {
  if (typeof window === 'undefined') return true
  try {
    const resolved = new URL(url, window.location.origin)
    return resolved.origin === window.location.origin
  } catch {
    return false
  }
}

/**
 * `fetch` with exponential backoff on 429 / 503. Sets client request id headers for
 * debug correlation when the URL is same-origin (dev proxy); skips them for direct
 * cross-origin Airtable calls to avoid CORS preflight failures.
 */
export async function fetchWithRetry(
  url: string | URL,
  init: RequestInit = {},
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const requestId = options.requestId ?? createRequestId()
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
  const href = typeof url === 'string' ? url : url.href
  const attachDebugHeaders = allowsClientDebugHeaders(href)

  let attempt = 0
  let lastResponse: Response | undefined

  while (attempt <= maxRetries) {
    const headers = new Headers(init.headers)
    if (attachDebugHeaders) {
      headers.set(CLIENT_REQUEST_ID_HEADER, requestId)
      headers.set(CLIENT_REQUEST_ATTEMPT_HEADER, String(attempt))
    }

    lastResponse = await fetch(href, { ...init, headers })

    if (!RETRYABLE_STATUS.has(lastResponse.status) || attempt >= maxRetries) {
      return lastResponse
    }

    await sleep(retryDelayMs(lastResponse, attempt))
    attempt++
  }

  return lastResponse!
}
