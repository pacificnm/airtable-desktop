import { useAirtable } from '../../../src/hooks/useAirtable.ts'
import { useAirtableMutation } from '../../../src/hooks/useAirtableMutation.ts'
import type { NotificationPayload } from '../../../src/lib/notifications/notificationTypes.ts'
import { notificationPayloadToAirtableFields } from '../lib/notificationPayload.ts'
import {
  getNotificationsTableConfig,
  NOTIFICATIONS_TABLE_KEY,
} from '../validation/notifications.ts'

export function useNotificationsCrud() {
  const { client, isReady } = useAirtable()
  const tableConfig = getNotificationsTableConfig()

  const createFromPayload = useAirtableMutation({
    tableKey: NOTIFICATIONS_TABLE_KEY,
    mutationFn: async (payload: NotificationPayload) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before saving notifications.')
      }
      const fields = notificationPayloadToAirtableFields(tableConfig, payload)
      const res = await client.createRecords<Record<string, unknown>>(
        tableConfig.tableId,
        [{ fields }],
      )
      return res.records[0]
    },
  })

  const markRead = useAirtableMutation({
    tableKey: NOTIFICATIONS_TABLE_KEY,
    mutationFn: async (recordId: string) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before updating notifications.')
      }
      const readField = tableConfig.fields.read ?? 'Read'
      await client.updateRecords(tableConfig.tableId, [
        { id: recordId, fields: { [readField]: true } },
      ])
    },
  })

  const markAllRead = useAirtableMutation({
    tableKey: NOTIFICATIONS_TABLE_KEY,
    mutationFn: async (recordIds: readonly string[]) => {
      if (!client || !tableConfig || recordIds.length === 0) return
      const readField = tableConfig.fields.read ?? 'Read'
      await client.updateRecords(
        tableConfig.tableId,
        recordIds.map((id) => ({ id, fields: { [readField]: true } })),
      )
    },
  })

  const deleteNotification = useAirtableMutation({
    tableKey: NOTIFICATIONS_TABLE_KEY,
    mutationFn: async (recordId: string) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before deleting notifications.')
      }
      await client.deleteRecords(tableConfig.tableId, [recordId])
    },
  })

  return {
    createFromPayload,
    markRead,
    markAllRead,
    deleteNotification,
    canMutate: isReady && !!tableConfig,
    tableConfig,
  }
}
