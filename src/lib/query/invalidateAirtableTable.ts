import type { QueryClient } from '@tanstack/react-query'
import { airtableKeys } from './airtableQueryKeys.ts'

/** Refetch all list + detail queries for a table (after create/update/delete). */
export async function invalidateAirtableTable(
  queryClient: QueryClient,
  tableKey: string,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: airtableKeys.table(tableKey) })
}
