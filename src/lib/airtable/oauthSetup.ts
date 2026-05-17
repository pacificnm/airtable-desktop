import type { AirtableEnv } from './env.ts'

export interface OAuthSetupStatus {
  redirectUri: string
  scopes: readonly string[]
  /** Must fix before OAuth can work. */
  blockers: readonly string[]
  /** Checklist for the Airtable integration settings page. */
  reminders: readonly string[]
}

function isLocalDevHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

/**
 * Redirect URI sent to Airtable. In dev, prefers the window origin when it only
 * differs from `.env` by localhost vs 127.0.0.1 (common misconfiguration).
 */
export function resolveOAuthRedirectUri(
  configured: string | undefined,
  windowOrigin?: string,
): string {
  const trimmed = configured?.trim()
  if (!trimmed) {
    return windowOrigin ? `${windowOrigin}/` : ''
  }
  if (!windowOrigin || import.meta.env.DEV !== true) return trimmed

  try {
    const configuredUrl = new URL(trimmed)
    const current = new URL(windowOrigin)
    if (
      configuredUrl.port === current.port &&
      configuredUrl.pathname === current.pathname &&
      isLocalDevHost(configuredUrl.hostname) &&
      isLocalDevHost(current.hostname) &&
      configuredUrl.hostname !== current.hostname
    ) {
      return `${current.origin}${configuredUrl.pathname}`
    }
  } catch {
    /* use configured string */
  }
  return trimmed
}

export function getOAuthSetupStatus(
  env: Pick<
    AirtableEnv,
    'oauthClientId' | 'oauthRedirectUri' | 'oauthScopes'
  >,
  windowOrigin?: string,
): OAuthSetupStatus {
  const blockers: string[] = []
  const reminders: string[] = []
  const redirectUri = resolveOAuthRedirectUri(env.oauthRedirectUri, windowOrigin)
  const scopes = env.oauthScopes

  if (!env.oauthClientId?.trim()) {
    blockers.push('Set VITE_AIRTABLE_OAUTH_CLIENT_ID in .env')
  }
  if (!redirectUri) {
    blockers.push('Set VITE_AIRTABLE_OAUTH_REDIRECT_URI in .env (or run inside the app)')
  }
  if (scopes.length === 0) {
    blockers.push('Set VITE_AIRTABLE_OAUTH_SCOPES in .env (space-separated)')
  }

  if (windowOrigin && env.oauthRedirectUri?.trim()) {
    try {
      const configured = new URL(env.oauthRedirectUri.trim())
      const resolved = new URL(redirectUri)
      const current = new URL(windowOrigin)
      if (
        configured.origin !== current.origin &&
        resolved.origin === current.origin
      ) {
        reminders.push(
          `Add this redirect URL in Airtable (app uses ${windowOrigin}, .env had ${env.oauthRedirectUri}):`,
        )
      } else if (configured.origin !== current.origin) {
        blockers.push(
          `App is at ${windowOrigin} but redirect URI is ${env.oauthRedirectUri}. Register both in Airtable or align .env with where the app runs.`,
        )
      }
    } catch {
      blockers.push('VITE_AIRTABLE_OAUTH_REDIRECT_URI is not a valid URL')
    }
  }

  reminders.push(
    `Register this redirect URL in Airtable (exact match, including trailing slash):`,
  )

  if (scopes.length > 0) {
    reminders.push(
      `Enable these scopes on the integration: ${scopes.join(', ')}`,
    )
  }

  reminders.push(
    'Set Support email, Privacy policy URL, and Terms of service URL on the integration.',
  )

  return {
    redirectUri,
    scopes,
    blockers,
    reminders,
  }
}
