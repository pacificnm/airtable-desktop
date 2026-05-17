/// <reference types="vite/client" />

declare const __APP_DISPLAY_NAME__: string

interface ImportMetaEnv {
  readonly VITE_AIRTABLE_PAT?: string
  readonly VITE_AIRTABLE_BASE_ID?: string
  readonly VITE_AIRTABLE_OAUTH_CLIENT_ID?: string
  readonly VITE_AIRTABLE_OAUTH_CLIENT_SECRET?: string
  readonly VITE_AIRTABLE_OAUTH_REDIRECT_URI?: string
  readonly VITE_AIRTABLE_OAUTH_SCOPES?: string
  /** Override token URL; default dev uses Vite proxy `/__airtable_oauth/v1/token`. */
  readonly VITE_AIRTABLE_OAUTH_TOKEN_URL?: string
  /** Set to `true` to enable the debug panel in production builds (internal QA). */
  readonly VITE_ENABLE_DEBUG_PANEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
