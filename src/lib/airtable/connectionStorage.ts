import {
  getActiveProfile,
  loadConnectionProfileStore,
  persistConnectionProfileStore,
  updateProfile,
  type ConnectionProfileStore,
} from './connectionProfiles.ts'

/** @deprecated Profiles are the source of truth — use connection profile APIs. */
export function readStoredPat(): string | null {
  const profile = getActiveProfile(loadConnectionProfileStore())
  const pat = profile.pat?.trim()
  return pat || null
}

/** @deprecated */
export function writeStoredPat(pat: string): void {
  const store = loadConnectionProfileStore()
  persistConnectionProfileStore(
    updateProfile(store, store.activeProfileId, { pat: pat.trim() }),
  )
}

/** @deprecated */
export function clearStoredPat(): void {
  const store = loadConnectionProfileStore()
  persistConnectionProfileStore(
    updateProfile(store, store.activeProfileId, { pat: undefined }),
  )
}

/** @deprecated */
export function readStoredBaseId(): string | null {
  const baseId = getActiveProfile(loadConnectionProfileStore()).baseId.trim()
  return baseId || null
}

/** @deprecated */
export function writeStoredBaseId(baseId: string): void {
  const store = loadConnectionProfileStore()
  persistConnectionProfileStore(
    updateProfile(store, store.activeProfileId, {
      baseId: baseId.trim(),
    }),
  )
}

/** @deprecated */
export function clearStoredBaseId(): void {
  const store = loadConnectionProfileStore()
  persistConnectionProfileStore(
    updateProfile(store, store.activeProfileId, { baseId: '' }),
  )
}

export type { ConnectionProfileStore }
