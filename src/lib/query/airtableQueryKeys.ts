import type { ListRecordsQuery } from '../airtable/types.ts'

/** Stable TanStack Query keys for Airtable table data. */
export const airtableKeys = {
  all: ['airtable'] as const,
  table: (tableKey: string) => [...airtableKeys.all, tableKey] as const,
  lists: (tableKey: string) => [...airtableKeys.table(tableKey), 'list'] as const,
  list: (tableKey: string, query?: ListRecordsQuery) =>
    [...airtableKeys.lists(tableKey), query ?? {}] as const,
  details: (tableKey: string) => [...airtableKeys.table(tableKey), 'detail'] as const,
  detail: (tableKey: string, recordId: string) =>
    [...airtableKeys.details(tableKey), recordId] as const,
}
