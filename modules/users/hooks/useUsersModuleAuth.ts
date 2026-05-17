import { useCallback, useEffect, useState } from 'react'
import { useAirtable } from '../../../src/hooks/useAirtable.ts'
import { escapeAirtableFormulaString } from '../lib/airtableFormula.ts'
import { verifyPassword } from '../lib/passwordCrypto.ts'
import {
  clearUsersModuleSession,
  readUsersModuleSession,
  writeUsersModuleSession,
  type UsersModuleSession,
} from '../lib/usersSession.ts'
import { getAppUsersTableConfig } from '../validation/users.ts'
import type { UsersAuthProvider } from '../lib/usersAuthConfig.ts'
import { parseLinkedRecordIds } from '../../roles/lib/linkedRecords.ts'
import { mapAirtableToConfigFields } from '../../../src/lib/airtable/mapRecordFields.ts'

export function useUsersModuleAuth(authProvider: UsersAuthProvider) {
  const { client, isReady, authMode } = useAirtable()
  const [session, setSession] = useState<UsersModuleSession | null>(() =>
    authProvider === 'custom_table' ? readUsersModuleSession() : null,
  )

  useEffect(() => {
    if (authProvider === 'custom_table') {
      setSession(readUsersModuleSession())
    } else {
      setSession(null)
    }
  }, [authProvider])

  const signIn = useCallback(
    async (login: string, password: string) => {
      if (authProvider !== 'custom_table') {
        throw new Error('Custom sign-in is only available in custom_table auth mode.')
      }
      if (!client) throw new Error('Connect to Airtable first.')
      const tableConfig = getAppUsersTableConfig()
      if (!tableConfig) throw new Error('App Users table is not configured.')

      const trimmed = login.trim()
      if (!trimmed || !password) throw new Error('Enter login and password.')

      const emailField = tableConfig.fields.email ?? 'Email'
      const usernameField = tableConfig.fields.username ?? 'Username'
      const escaped = escapeAirtableFormulaString(trimmed)
      const formula = `OR({${emailField}}='${escaped}', {${usernameField}}='${escaped}')`

      const res = await client.listRecords<Record<string, unknown>>(
        tableConfig.tableId,
        { filterByFormula: formula, maxRecords: 1 },
      )
      const record = res.records[0]
      if (!record) throw new Error('Invalid email/username or password.')

      const fields = mapAirtableToConfigFields<{
        email?: string
        displayName?: string
        username?: string
        passwordHash?: string
        active?: unknown
        role?: unknown
      }>(tableConfig, record.fields)

      if (fields.active === false || String(fields.active).toLowerCase() === 'false') {
        throw new Error('This account is inactive.')
      }

      const hash = fields.passwordHash ?? ''
      const ok = await verifyPassword(password, hash)
      if (!ok) throw new Error('Invalid email/username or password.')

      const next: UsersModuleSession = {
        userRecordId: record.id,
        email: fields.email?.trim() ?? trimmed,
        displayName:
          fields.displayName?.trim() ||
          fields.email?.trim() ||
          fields.username?.trim() ||
          'User',
        username: fields.username?.trim() || undefined,
        roleIds: parseLinkedRecordIds(fields.role),
        authProvider: 'custom_table',
        signedInAtMs: Date.now(),
      }
      writeUsersModuleSession(next)
      setSession(next)
      return next
    },
    [authProvider, client],
  )

  const signOut = useCallback(() => {
    clearUsersModuleSession()
    setSession(null)
  }, [])

  const isCustomSignedIn = authProvider === 'custom_table' && session != null
  const requiresCustomSignIn = authProvider === 'custom_table' && !session

  return {
    session,
    signIn,
    signOut,
    isCustomSignedIn,
    requiresCustomSignIn,
    isOAuthConnection: authMode === 'oauth' && isReady,
  }
}
