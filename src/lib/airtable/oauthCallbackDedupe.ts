/** Result of handling `?code=&state=` on redirect. */
export type OAuthCallbackResult = 'no_params' | 'exchanged' | 'already_done'

const inflight = new Map<string, Promise<OAuthCallbackResult>>()
const completed = new Set<string>()

/** Remove OAuth query params so remounted handlers (e.g. StrictMode) do not retry. */
export function stripOAuthQueryFromUrl(): void {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('code') && !url.searchParams.has('state')) return
  url.searchParams.delete('code')
  url.searchParams.delete('state')
  const next =
    url.pathname +
    (url.searchParams.toString() ? `?${url.searchParams}` : '') +
    url.hash
  window.history.replaceState({}, '', next)
}

/**
 * Authorization codes are single-use. React StrictMode runs effects twice in dev,
 * which otherwise exchanges the same code twice ("Unrecognized grant code").
 */
export function runOAuthCallbackOnce(
  code: string,
  execute: () => Promise<void>,
): Promise<OAuthCallbackResult> {
  if (completed.has(code)) return Promise.resolve('already_done')

  const existing = inflight.get(code)
  if (existing) return existing

  const promise = execute()
    .then(() => {
      completed.add(code)
      return 'exchanged' as const
    })
    .finally(() => {
      inflight.delete(code)
    })

  inflight.set(code, promise)
  return promise
}

/** Test helper */
export function resetOAuthCallbackDedupeForTests(): void {
  inflight.clear()
  completed.clear()
}
