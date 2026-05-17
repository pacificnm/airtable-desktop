import type { AirtableTableConfig } from '../../../src/config/tables.ts'
import { getTableConfig } from '../../../src/config/tables.ts'

export const NOTIFICATIONS_TABLE_KEY = 'notifications'

export function getNotificationsTableConfig(): AirtableTableConfig | undefined {
  return getTableConfig(NOTIFICATIONS_TABLE_KEY)
}
