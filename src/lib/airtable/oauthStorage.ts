import type { OAuthTokenResponse } from './types.ts'

const SESSION_KEY = 'airtable.oauth.session'
const PENDING_KEY = 'airtable.oauth.pending'
/** PKCE pending older than this is ignored (ms). */
const PENDING_MAX_AGE_MS = 15 * 60 * 1000

export interface OAuthPending {
  state: string
  verifier: string
  createdAtMs: number
}

export interface OAuthSessionPersisted {
  accessToken: string
  refreshToken: string
  /** epoch ms when access token should be treated as expired */
  expiresAtMs: number
}

function readOAuthPendingRaw(): OAuthPending | null {
  try {
    const raw =
      localStorage.getItem(PENDING_KEY) ?? sessionStorage.getItem(PENDING_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as OAuthPending
    if (!parsed.state || !parsed.verifier) return null
    const createdAtMs =
      typeof parsed.createdAtMs === 'number' ? parsed.createdAtMs : 0
    if (createdAtMs > 0 && Date.now() - createdAtMs > PENDING_MAX_AGE_MS) {
      clearOAuthPending()
      return null
    }
    return { ...parsed, createdAtMs: createdAtMs || Date.now() }
  } catch {
    return null
  }
}

export function readOAuthPending(): OAuthPending | null {
  return readOAuthPendingRaw()
}

export function writeOAuthPending(
  pending: Pick<OAuthPending, 'state' | 'verifier'>,
): void {
  const payload: OAuthPending = {
    ...pending,
    createdAtMs: Date.now(),
  }
  localStorage.setItem(PENDING_KEY, JSON.stringify(payload))
  sessionStorage.removeItem(PENDING_KEY)
}

export function clearOAuthPending(): void {
  localStorage.removeItem(PENDING_KEY)
  sessionStorage.removeItem(PENDING_KEY)
}

export function readOAuthSession(): OAuthSessionPersisted | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as OAuthSessionPersisted
  } catch {
    return null
  }
}

export function writeOAuthSessionFromResponse(
  res: OAuthTokenResponse,
): OAuthSessionPersisted {
  const expiresAtMs = Date.now() + Math.max(0, res.expires_in) * 1000
  const session: OAuthSessionPersisted = {
    accessToken: res.access_token,
    refreshToken: res.refresh_token,
    expiresAtMs,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function clearOAuthSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
