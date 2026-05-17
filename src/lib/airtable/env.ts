import { normalizeBaseId } from './baseId.ts'

export interface AirtableEnv {
  pat: string | undefined
  defaultBaseId: string | undefined
  oauthClientId: string | undefined
  oauthRedirectUri: string | undefined
  oauthScopes: string[]
  /**
   * Token URL used when falling back to `fetch` (plain browser).
   * In Electron, `postOAuthTokenRequest` uses the main process instead (no CORS).
   * @see https://airtable.com/developers/web/api/oauth-reference#cross-origin-resource-sharing-cors
   */
  oauthTokenUrl: string
}

export function readAirtableEnv(): AirtableEnv {
  const scopesRaw = import.meta.env.VITE_AIRTABLE_OAUTH_SCOPES as
    | string
    | undefined
  const scopes =
    scopesRaw?.split(/\s+/).filter((s) => s.length > 0) ?? []

  const defaultTokenUrl =
    import.meta.env.DEV === true
      ? '/__airtable_oauth/v1/token'
      : 'https://airtable.com/oauth2/v1/token'

  return {
    pat: import.meta.env.VITE_AIRTABLE_PAT as string | undefined,
    defaultBaseId: normalizeBaseId(
      import.meta.env.VITE_AIRTABLE_BASE_ID as string | undefined,
    ),
    oauthClientId: import.meta.env.VITE_AIRTABLE_OAUTH_CLIENT_ID as
      | string
      | undefined,
    oauthRedirectUri: import.meta.env.VITE_AIRTABLE_OAUTH_REDIRECT_URI as
      | string
      | undefined,
    oauthScopes: scopes,
    oauthTokenUrl:
      (import.meta.env.VITE_AIRTABLE_OAUTH_TOKEN_URL as string | undefined) ??
      defaultTokenUrl,
  }
}
