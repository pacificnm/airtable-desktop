import { useMemo } from 'react'
import { useAirtableListQuery } from '../../../src/hooks/useAirtableTableQuery.ts'
import { appUsersFromRecords, type AppUserRecord } from '../lib/userFromRecords.ts'
import { APP_USERS_TABLE_KEY } from '../validation/users.ts'

export function useAppUsers() {
  const query = useAirtableListQuery(APP_USERS_TABLE_KEY)

  const users = useMemo((): AppUserRecord[] => {
    const records = query.data?.records ?? []
    return appUsersFromRecords(records)
  }, [query.data?.records])

  return { ...query, users }
}
