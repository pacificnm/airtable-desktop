import { createContext } from 'react'
import type { ConnectionProfile } from '../lib/airtable/connectionProfiles.ts'
import type { OAuthCallbackResult } from '../lib/airtable/oauthCallbackDedupe.ts'
import type { AirtableClient } from '../lib/airtable/airtableClient.ts'

export type AirtableAuthMode = 'pat' | 'oauth' | 'none'

export type PatSource = 'stored' | 'env' | null

export interface AirtableContextValue {
  /** Resolved base id: prop → stored → env */
  baseId: string | undefined
  /** REST client when `baseId` and auth are available */
  client: AirtableClient | null
  authMode: AirtableAuthMode
  /** True when `baseId` is set and a token (PAT or OAuth) is available */
  isReady: boolean
  /** Whether a PAT is configured (stored or env). Token value is never exposed. */
  hasPat: boolean
  /** Where the active PAT comes from when `authMode === 'pat'`. */
  patSource: PatSource
  /** Save a personal access token locally (takes precedence over env). */
  setPat: (pat: string) => void
  /** Remove the locally stored PAT (env PAT, if any, remains). */
  clearPat: () => void
  /** Persist base id locally (used when no `baseId` prop on the provider). */
  setBaseId: (baseId: string) => void
  /** Begin Airtable OAuth (PKCE). Requires env + registered integration. */
  startOAuthLogin: () => Promise<void>
  /**
   * If the current URL contains OAuth `code` + `state`, exchange and persist tokens.
   */
  completeOAuthFromCurrentUrl: () => Promise<OAuthCallbackResult>
  /** Clear OAuth session (PAT in env is unchanged). */
  signOutOAuth: () => void
  /** Named connection profiles (base id + PAT per profile). */
  profiles: readonly ConnectionProfile[]
  activeProfile: ConnectionProfile
  switchProfile: (profileId: string) => void
  createProfile: (name: string) => void
  renameProfile: (profileId: string, name: string) => void
  deleteProfile: (profileId: string) => void
}

export const AirtableContext = createContext<AirtableContextValue | null>(null)
