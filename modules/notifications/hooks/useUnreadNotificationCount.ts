import { useMemo } from 'react'
import { useNotifications } from './useNotifications.ts'

export function useUnreadNotificationCount(): number {
  const { notifications } = useNotifications()
  return useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )
}
