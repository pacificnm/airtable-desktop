import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeNotifications } from '../../../src/lib/notifications/index.ts'
import { notificationsQueryKeys } from '../lib/notificationsQueryKeys.ts'
import { useNotificationsCrud } from '../hooks/useNotificationsCrud.ts'

/** Subscribes to the notification bus and persists payloads to Airtable. */
export function NotificationBusBridge() {
  const crud = useNotificationsCrud()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!crud.canMutate) return

    return subscribeNotifications((payload) => {
      void (async () => {
        try {
          await crud.createFromPayload.mutateAsync(payload)
          await queryClient.invalidateQueries({
            queryKey: notificationsQueryKeys.all,
          })
        } catch (err) {
          console.error('[notifications] failed to persist notification', err)
        }
      })()
    })
  }, [crud.canMutate, crud.createFromPayload, queryClient])

  return null
}
