import type { OAuthSessionPersisted } from './oauthStorage.ts'
import {
  clearOAuthSession,
  readOAuthSession,
  writeOAuthSessionFromResponse,
} from './oauthStorage.ts'
import type { OAuthTokenResponse } from './types.ts'

export interface ConnectionProfile {
  id: string
  name: string
  baseId: string
  pat?: string
  oauthSession?: OAuthSessionPersisted
}

export interface ConnectionProfileStore {
  profiles: ConnectionProfile[]
  activeProfileId: string
}

const STORE_KEY = 'airtable.connection.profiles.v1'
const LEGACY_PAT_KEY = 'airtable.connection.pat'
const LEGACY_BASE_KEY = 'airtable.connection.baseId'

function newProfileId(): string {
  return `profile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function defaultStore(): ConnectionProfileStore {
  const id = newProfileId()
  return {
    profiles: [{ id, name: 'Default', baseId: '' }],
    activeProfileId: id,
  }
}

function migrateLegacyStore(): ConnectionProfileStore | null {
  try {
    const legacyPat = localStorage.getItem(LEGACY_PAT_KEY)?.trim()
    const legacyBase = localStorage.getItem(LEGACY_BASE_KEY)?.trim()
    if (!legacyPat && !legacyBase) return null

    const id = newProfileId()
    const profile: ConnectionProfile = {
      id,
      name: 'Default',
      baseId: legacyBase ?? '',
      ...(legacyPat ? { pat: legacyPat } : {}),
    }

    const oauth = readOAuthSession()
    if (oauth) profile.oauthSession = oauth

    localStorage.removeItem(LEGACY_PAT_KEY)
    localStorage.removeItem(LEGACY_BASE_KEY)

    return { profiles: [profile], activeProfileId: id }
  } catch {
    return null
  }
}

export function loadConnectionProfileStore(): ConnectionProfileStore {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ConnectionProfileStore
      if (
        Array.isArray(parsed.profiles) &&
        parsed.profiles.length > 0 &&
        parsed.activeProfileId
      ) {
        const activeExists = parsed.profiles.some(
          (p) => p.id === parsed.activeProfileId,
        )
        return activeExists
          ? parsed
          : { ...parsed, activeProfileId: parsed.profiles[0]!.id }
      }
    }
  } catch {
    /* fall through */
  }

  return migrateLegacyStore() ?? defaultStore()
}

export function persistConnectionProfileStore(
  store: ConnectionProfileStore,
): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

export function getActiveProfile(
  store: ConnectionProfileStore,
): ConnectionProfile {
  return (
    store.profiles.find((p) => p.id === store.activeProfileId) ??
    store.profiles[0]!
  )
}

/** Persist current sessionStorage OAuth token onto a profile. */
export function snapshotOAuthToProfile(
  profile: ConnectionProfile,
): ConnectionProfile {
  const oauth = readOAuthSession()
  if (oauth) return { ...profile, oauthSession: oauth }
  const rest = { ...profile }
  delete rest.oauthSession
  return rest
}

export function applyProfileOAuth(profile: ConnectionProfile): void {
  clearOAuthSession()
  if (profile.oauthSession) {
    try {
      sessionStorage.setItem(
        'airtable.oauth.session',
        JSON.stringify(profile.oauthSession),
      )
    } catch {
      /* ignore */
    }
  }
}

export function createProfile(
  store: ConnectionProfileStore,
  name: string,
  partial?: Pick<ConnectionProfile, 'baseId' | 'pat'>,
): ConnectionProfileStore {
  const id = newProfileId()
  const profile: ConnectionProfile = {
    id,
    name: name.trim() || 'New profile',
    baseId: partial?.baseId?.trim() ?? '',
    ...(partial?.pat?.trim() ? { pat: partial.pat.trim() } : {}),
  }
  return {
    profiles: [...store.profiles, profile],
    activeProfileId: id,
  }
}

export function updateProfile(
  store: ConnectionProfileStore,
  profileId: string,
  patch: Partial<Pick<ConnectionProfile, 'name' | 'baseId' | 'pat' | 'oauthSession'>>,
): ConnectionProfileStore {
  return {
    ...store,
    profiles: store.profiles.map((p) => {
      if (p.id !== profileId) return p
      const next: ConnectionProfile = { ...p, ...patch }
      if (Object.prototype.hasOwnProperty.call(patch, 'pat') && patch.pat === undefined) {
        delete next.pat
      }
      if (
        Object.prototype.hasOwnProperty.call(patch, 'oauthSession') &&
        patch.oauthSession === undefined
      ) {
        delete next.oauthSession
      }
      return next
    }),
  }
}

export function deleteProfile(
  store: ConnectionProfileStore,
  profileId: string,
): ConnectionProfileStore {
  if (store.profiles.length <= 1) return store
  const profiles = store.profiles.filter((p) => p.id !== profileId)
  const activeProfileId =
    store.activeProfileId === profileId
      ? profiles[0]!.id
      : store.activeProfileId
  return { profiles, activeProfileId }
}

export function switchActiveProfile(
  store: ConnectionProfileStore,
  profileId: string,
): ConnectionProfileStore {
  if (!store.profiles.some((p) => p.id === profileId)) return store

  const profiles = store.profiles.map((p) =>
    p.id === store.activeProfileId ? snapshotOAuthToProfile(p) : p,
  )

  const target = profiles.find((p) => p.id === profileId)!
  applyProfileOAuth(target)

  return { profiles, activeProfileId: profileId }
}

export function writeOAuthToActiveProfile(
  store: ConnectionProfileStore,
  res: OAuthTokenResponse,
): ConnectionProfileStore {
  const session = writeOAuthSessionFromResponse(res)
  return updateProfile(store, store.activeProfileId, { oauthSession: session })
}

export function clearOAuthOnActiveProfile(
  store: ConnectionProfileStore,
): ConnectionProfileStore {
  clearOAuthSession()
  return updateProfile(store, store.activeProfileId, { oauthSession: undefined })
}
