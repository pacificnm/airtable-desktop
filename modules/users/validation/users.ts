import type { AirtableTableConfig } from '../../../src/config/tables.ts'
import { getTableConfig } from '../../../src/config/tables.ts'

export const APP_USERS_TABLE_KEY = 'appUsers'

export function getAppUsersTableConfig(): AirtableTableConfig | undefined {
  return getTableConfig(APP_USERS_TABLE_KEY)
}
