import type { QueryClient } from '@tanstack/react-query'
import {
  getActiveProfile,
  loadConnectionProfileStore,
} from '../airtable/connectionProfiles.ts'
import { clearAirtableTableCache } from '../airtable/cache/airtableDataCache.ts'
import { getTableConfig } from '../../config/tables.ts'
import { airtableKeys } from './airtableQueryKeys.ts'

/** Refetch all list + detail queries for a table (after create/update/delete). */
export async function invalidateAirtableTable(
  queryClient: QueryClient,
  tableKey: string,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: airtableKeys.table(tableKey) })

  const config = getTableConfig(tableKey)
  const baseId = getActiveProfile(loadConnectionProfileStore()).baseId?.trim()
  if (config?.tableId && baseId) {
    clearAirtableTableCache(baseId, config.tableId)
  }
}
