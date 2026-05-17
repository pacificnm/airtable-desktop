import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AirtableRestClient } from '../lib/airtable/restClient.ts'
import { normalizeBaseId } from '../lib/airtable/baseId.ts'
import { readAirtableEnv } from '../lib/airtable/env.ts'
import {
  runOAuthCallbackOnce,
  stripOAuthQueryFromUrl,
  type OAuthCallbackResult,
} from '../lib/airtable/oauthCallbackDedupe.ts'
import {
  getOAuthSetupStatus,
  resolveOAuthRedirectUri,
} from '../lib/airtable/oauthSetup.ts'
import {
  buildAuthorizationUrl,
  createPkcePairS256,
  exchangeAuthorizationCode,
  randomOAuthString,
  refreshAccessToken,
} from '../lib/airtable/oauth.ts'
import type { OAuthSessionPersisted } from '../lib/airtable/oauthStorage.ts'
import {
  clearOAuthPending,
  readOAuthPending,
  readOAuthSession,
  writeOAuthPending,
} from '../lib/airtable/oauthStorage.ts'
import {
  applyProfileOAuth,
  clearOAuthOnActiveProfile,
  createProfile as createProfileInStore,
  deleteProfile as deleteProfileInStore,
  getActiveProfile,
  loadConnectionProfileStore,
  persistConnectionProfileStore,
  switchActiveProfile,
  updateProfile,
  writeOAuthToActiveProfile,
  type ConnectionProfileStore,
} from '../lib/airtable/connectionProfiles.ts'
import { queryClient } from '../lib/query/queryClient.ts'
import {
  AirtableContext,
  type AirtableAuthMode,
  type AirtableContextValue,
  type PatSource,
} from './airtableContext.ts'

export type {
  AirtableAuthMode,
  AirtableContextValue,
  PatSource,
} from './airtableContext.ts'

function resolvePat(
  profilePat: string | undefined,
  envPat: string | undefined,
): { token: string | null; source: PatSource } {
  const stored = profilePat?.trim()
  if (stored) return { token: stored, source: 'stored' }
  const env = envPat?.trim()
  if (env) return { token: env, source: 'env' }
  return { token: null, source: null }
}

function readOAuthFromStorage(): OAuthSessionPersisted | null {
  return readOAuthSession()
}

export function AirtableProvider({
  children,
  baseId: baseIdProp,
}: {
  children: ReactNode
  baseId?: string
}) {
  const env = useMemo(() => readAirtableEnv(), [])

  const [profileStore, setProfileStore] = useState<ConnectionProfileStore>(() => {
    const store = loadConnectionProfileStore()
    const active = getActiveProfile(store)
    applyProfileOAuth(active)
    return store
  })

  const activeProfile = useMemo(
    () => getActiveProfile(profileStore),
    [profileStore],
  )

  const [oauthSession, setOAuthSession] = useState<OAuthSessionPersisted | null>(
    () => readOAuthFromStorage(),
  )

  const commitStore = useCallback(
    (updater: (prev: ConnectionProfileStore) => ConnectionProfileStore) => {
      setProfileStore((prev) => {
        const next = updater(prev)
        persistConnectionProfileStore(next)
        return next
      })
    },
    [],
  )

  const baseId =
    normalizeBaseId(baseIdProp) ||
    normalizeBaseId(activeProfile.baseId) ||
    env.defaultBaseId ||
    undefined

  const { token: patToken, source: patSource } = useMemo(
    () => resolvePat(activeProfile.pat, env.pat),
    [activeProfile.pat, env.pat],
  )

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (patToken) return patToken

    const session = readOAuthFromStorage()
    if (!session) return null

    const bufferMs = 60_000
    if (Date.now() < session.expiresAtMs - bufferMs) {
      return session.accessToken
    }

    if (!env.oauthClientId) return null

    const clientSecret = import.meta.env
      .VITE_AIRTABLE_OAUTH_CLIENT_SECRET as string | undefined

    const refreshed = await refreshAccessToken({
      tokenUrl: env.oauthTokenUrl,
      refreshToken: session.refreshToken,
      clientId: env.oauthClientId,
      clientSecret,
    })
    commitStore((prev) => writeOAuthToActiveProfile(prev, refreshed))
    const sessionAfter = readOAuthFromStorage()
    setOAuthSession(sessionAfter)
    return sessionAfter?.accessToken ?? null
  }, [commitStore, env, patToken])

  const client = useMemo(() => {
    if (!baseId) return null
    return new AirtableRestClient({ baseId, getAccessToken })
  }, [baseId, getAccessToken])

  const authMode: AirtableAuthMode = useMemo(() => {
    if (patToken) return 'pat'
    if (oauthSession?.accessToken) return 'oauth'
    return 'none'
  }, [patToken, oauthSession?.accessToken])

  const hasPat = Boolean(patToken)

  const isReady = Boolean(
    baseId && (patToken || oauthSession?.accessToken),
  )

  const setPat = useCallback((pat: string) => {
    const trimmed = pat.trim()
    if (!trimmed) return
    commitStore((prev) =>
      updateProfile(prev, prev.activeProfileId, { pat: trimmed }),
    )
  }, [commitStore])

  const clearPat = useCallback(() => {
    commitStore((prev) =>
      updateProfile(prev, prev.activeProfileId, { pat: undefined }),
    )
  }, [commitStore])

  const setBaseId = useCallback(
    (id: string) => {
      const normalized = normalizeBaseId(id)
      if (!normalized) return
      commitStore((prev) =>
        updateProfile(prev, prev.activeProfileId, { baseId: normalized }),
      )
    },
    [commitStore],
  )

  const switchProfile = useCallback(
    (profileId: string) => {
      commitStore((prev) => {
        if (profileId === prev.activeProfileId) return prev
        return switchActiveProfile(prev, profileId)
      })
      setOAuthSession(readOAuthFromStorage())
      void queryClient.invalidateQueries()
    },
    [commitStore],
  )

  const createProfile = useCallback(
    (name: string) => {
      commitStore((prev) => {
        const next = createProfileInStore(prev, name)
        applyProfileOAuth(getActiveProfile(next))
        return next
      })
      setOAuthSession(null)
      void queryClient.invalidateQueries()
    },
    [commitStore],
  )

  const renameProfile = useCallback(
    (profileId: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      commitStore((prev) => updateProfile(prev, profileId, { name: trimmed }))
    },
    [commitStore],
  )

  const deleteProfile = useCallback(
    (profileId: string) => {
      commitStore((prev) => {
        const next = deleteProfileInStore(prev, profileId)
        if (next === prev) return prev
        applyProfileOAuth(getActiveProfile(next))
        return next
      })
      setOAuthSession(readOAuthFromStorage())
      void queryClient.invalidateQueries()
    },
    [commitStore],
  )

  const getOAuthRedirectUri = useCallback(() => {
    return resolveOAuthRedirectUri(
      env.oauthRedirectUri,
      typeof window !== 'undefined' ? window.location.origin : undefined,
    )
  }, [env.oauthRedirectUri])

  const startOAuthLogin = useCallback(async () => {
    const redirectUri = getOAuthRedirectUri()
    const setup = getOAuthSetupStatus(
      env,
      typeof window !== 'undefined' ? window.location.origin : undefined,
    )
    if (!env.oauthClientId || !redirectUri) {
      throw new Error(
        'OAuth is not configured: set VITE_AIRTABLE_OAUTH_CLIENT_ID and VITE_AIRTABLE_OAUTH_REDIRECT_URI',
      )
    }
    if (env.oauthScopes.length === 0) {
      throw new Error(
        'OAuth scopes missing: set VITE_AIRTABLE_OAUTH_SCOPES (space-separated)',
      )
    }
    const state = randomOAuthString(32)
    const { verifier, challenge } = await createPkcePairS256()
    writeOAuthPending({ state, verifier })
    const url = buildAuthorizationUrl({
      clientId: env.oauthClientId,
      redirectUri,
      scope: env.oauthScopes.join(' '),
      state,
      codeChallenge: challenge,
    })
    if (import.meta.env.DEV) {
      console.info('[OAuth] Register redirect URL in Airtable:', redirectUri)
      if (setup.reminders.length > 0) {
        console.info('[OAuth] Setup reminders:', setup.reminders)
      }
    }
    window.location.assign(url)
  }, [env, getOAuthRedirectUri])

  const completeOAuthFromCurrentUrl =
    useCallback(async (): Promise<OAuthCallbackResult> => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const state = params.get('state')
      if (!code || !state) return 'no_params'

      return runOAuthCallbackOnce(code, async () => {
        stripOAuthQueryFromUrl()

        const pending = readOAuthPending()
        if (!pending || pending.state !== state) {
          clearOAuthPending()
          throw new Error(
            !pending
              ? 'OAuth could not finish — login state was lost during redirect. Sign in again.'
              : 'OAuth state mismatch. Sign in again.',
          )
        }
        const redirectUri = getOAuthRedirectUri()
        if (!env.oauthClientId || !redirectUri) {
          clearOAuthPending()
          throw new Error('OAuth is not configured')
        }

        const clientSecret = import.meta.env
          .VITE_AIRTABLE_OAUTH_CLIENT_SECRET as string | undefined

        try {
          const tokens = await exchangeAuthorizationCode({
            tokenUrl: env.oauthTokenUrl,
            redirectUri,
            clientId: env.oauthClientId,
            clientSecret,
            codeVerifier: pending.verifier,
            code,
          })
          clearOAuthPending()
          commitStore((prev) => {
            let next = writeOAuthToActiveProfile(prev, tokens)
            const profile = getActiveProfile(next)
            if (!normalizeBaseId(profile.baseId) && env.defaultBaseId) {
              next = updateProfile(next, next.activeProfileId, {
                baseId: env.defaultBaseId,
              })
            }
            return next
          })
          setOAuthSession(readOAuthFromStorage())
        } catch (err) {
          clearOAuthPending()
          throw err
        }
      })
    }, [commitStore, env, getOAuthRedirectUri])

  const signOutOAuth = useCallback(() => {
    clearOAuthPending()
    commitStore((prev) => clearOAuthOnActiveProfile(prev))
    setOAuthSession(null)
  }, [commitStore])

  const value = useMemo<AirtableContextValue>(
    () => ({
      baseId,
      client,
      authMode,
      isReady,
      hasPat,
      patSource,
      setPat,
      clearPat,
      setBaseId,
      startOAuthLogin,
      completeOAuthFromCurrentUrl,
      signOutOAuth,
      profiles: profileStore.profiles,
      activeProfile,
      switchProfile,
      createProfile,
      renameProfile,
      deleteProfile,
    }),
    [
      baseId,
      client,
      authMode,
      isReady,
      hasPat,
      patSource,
      setPat,
      clearPat,
      setBaseId,
      startOAuthLogin,
      completeOAuthFromCurrentUrl,
      signOutOAuth,
      profileStore.profiles,
      activeProfile,
      switchProfile,
      createProfile,
      renameProfile,
      deleteProfile,
    ],
  )

  return (
    <AirtableContext.Provider value={value}>{children}</AirtableContext.Provider>
  )
}
