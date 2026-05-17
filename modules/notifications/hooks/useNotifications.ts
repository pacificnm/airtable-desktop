import { useMemo } from 'react'
import { useAirtableListQuery } from '../../../src/hooks/useAirtableTableQuery.ts'
import { recordToNotification } from '../lib/notificationFromRecords.ts'
import { NOTIFICATIONS_TABLE_KEY } from '../validation/notifications.ts'

export function useNotifications() {
  const query = useAirtableListQuery(NOTIFICATIONS_TABLE_KEY)

  const notifications = useMemo(() => {
    const items = (query.data?.records ?? [])
      .map(recordToNotification)
      .filter((n): n is NonNullable<typeof n> => n != null)
    return items.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  }, [query.data?.records])

  return {
    notifications,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
