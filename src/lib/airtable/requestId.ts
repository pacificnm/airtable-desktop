/** Correlates retries and debug panel rows for one logical API call. */
export function createRequestId(): string {
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const CLIENT_REQUEST_ID_HEADER = 'X-Client-Request-Id'
export const CLIENT_REQUEST_ATTEMPT_HEADER = 'X-Client-Request-Attempt'
