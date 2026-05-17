import { useEffect, useMemo, useState } from 'react'
import { useAirtable } from './useAirtable.ts'
import type { AppUser } from '../types/appUser.ts'

function nameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim()
  if (!local) return email
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function guestUser(authMode: AppUser['authMode'], baseId?: string): AppUser {
  return {
    displayName: 'Not connected',
    subtitle: 'Open menu → Airtable connection',
    authMode,
    baseId,
  }
}

function authSubtitle(authMode: AppUser['authMode'], userId?: string): string {
  if (authMode === 'oauth') return 'Signed in with OAuth'
  if (authMode === 'pat') return 'Personal access token'
  return userId ?? 'Connected'
}

export function useAppUser(): {
  user: AppUser
  loading: boolean
  refresh: () => void
} {
  const { client, isReady, authMode, baseId, activeProfile } = useAirtable()
  const disconnectedUser = useMemo(
    () => guestUser(authMode, baseId),
    [authMode, baseId],
  )
  const [connectedUser, setConnectedUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!isReady || !client) return

    let cancelled = false

    void (async () => {
      setLoading(true)
      try {
        const who = await client.whoami()
        if (cancelled) return

        const email = who.email?.trim()
        setConnectedUser({
          displayName: email ? nameFromEmail(email) : 'Airtable user',
          subtitle: email
            ? `${activeProfile.name} · ${email}`
            : `${activeProfile.name} · ${authSubtitle(authMode, who.id)}`,
          email: email || undefined,
          userId: who.id,
          authMode,
          baseId,
        })
      } catch {
        if (cancelled) return
        setConnectedUser({
          displayName:
            authMode === 'pat' ? 'Personal access token' : 'Airtable account',
          subtitle: baseId ? `Base ${baseId}` : authSubtitle(authMode),
          authMode,
          baseId,
        })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [client, isReady, authMode, baseId, activeProfile.name, refreshKey])

  const user =
    !isReady || !client ? disconnectedUser : (connectedUser ?? disconnectedUser)

  return {
    user,
    loading: isReady && !!client && loading,
    refresh: () => setRefreshKey((k) => k + 1),
  }
}
