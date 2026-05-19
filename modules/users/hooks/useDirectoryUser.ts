import { useEffect, useMemo, useState } from 'react'
import { useAirtable } from '../../../src/hooks/useAirtable.ts'
import { useAppUser } from '../../../src/hooks/useAppUser.ts'
import { useUsersAuthConfig } from './useUsersAuthConfig.ts'
import { useUsersModuleAuth } from './useUsersModuleAuth.ts'
import { useAppUsers } from './useAppUsers.ts'
import { syncOAuthUserProfile } from '../lib/syncOAuthProfile.ts'
import { getAppUsersTableConfig } from '../validation/users.ts'

/** Unified “directory user” for UI: OAuth whoami, custom session, or extended profile row. */
export function useDirectoryUser() {
  const { authProvider, extendOAuthProfiles, isLoading: configLoading } =
    useUsersAuthConfig()
  const { user: oauthShellUser, loading: oauthLoading } = useAppUser()
  const { client, isReady } = useAirtable()
  const { session, isCustomSignedIn } = useUsersModuleAuth(authProvider)
  const { users } = useAppUsers()

  const [createdRecordId, setCreatedRecordId] = useState<string | null>(null)

  const profileFromTable = useMemo(() => {
    if (authProvider === 'custom_table' && session) {
      return users.find((u) => u.id === session.userRecordId)
    }
    if (authProvider === 'airtable_oauth' && oauthShellUser.userId) {
      return users.find((u) => u.airtableUserId === oauthShellUser.userId)
    }
    return undefined
  }, [authProvider, session, users, oauthShellUser.userId])

  const existingRecordId =
    authProvider === 'airtable_oauth' && oauthShellUser.userId
      ? (users.find((u) => u.airtableUserId === oauthShellUser.userId)?.id ?? null)
      : null

  const syncedRecordId = existingRecordId ?? createdRecordId

  useEffect(() => {
    if (
      authProvider !== 'airtable_oauth' ||
      !extendOAuthProfiles ||
      !client ||
      !isReady ||
      oauthShellUser.userId == null ||
      existingRecordId != null
    ) {
      return
    }

    const tableConfig = getAppUsersTableConfig()
    if (!tableConfig) return

    let cancelled = false
    void (async () => {
      try {
        const who = await client.whoami()
        if (cancelled) return
        const result = await syncOAuthUserProfile(client, tableConfig, who)
        if (!cancelled) setCreatedRecordId(result.recordId)
      } catch {
        /* optional sync */
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    authProvider,
    extendOAuthProfiles,
    client,
    isReady,
    oauthShellUser.userId,
    existingRecordId,
  ])

  const displayName =
    profileFromTable?.displayName ??
    session?.displayName ??
    oauthShellUser.displayName

  const email =
    profileFromTable?.email ?? session?.email ?? oauthShellUser.email

  return {
    authProvider,
    extendOAuthProfiles,
    displayName,
    email,
    profile: profileFromTable,
    session,
    isCustomSignedIn,
    oauthShellUser,
    syncedRecordId,
    isLoading: configLoading || oauthLoading,
  }
}
