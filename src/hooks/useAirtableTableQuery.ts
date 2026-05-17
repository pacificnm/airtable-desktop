import { getTableConfig, type TableKey } from '../config/tables.ts'
import {
  normalizeRecord,
  type NormalizedRecord,
} from '../lib/airtable/mapRecordFields.ts'
import { airtableKeys } from '../lib/query/airtableQueryKeys.ts'
import type { ListRecordsQuery } from '../lib/airtable/types.ts'
import { useAirtable } from './useAirtable.ts'
import { useAirtableQuery } from './useAirtableQuery.ts'

export type AirtableListQueryData<
  TFields extends Record<string, unknown> = Record<string, unknown>,
> = {
  records: NormalizedRecord<TFields>[]
  offset?: string
}

export type UseAirtableListQueryOptions = {
  enabled?: boolean
  staleTime?: number
  /** Passed through to TanStack Query — refetch on an interval (ms). */
  refetchInterval?: number | false
}

/**
 * Cached list query for a configured table (no generated CRUD hook required).
 * Uses `tables.ts` list defaults and `views.default`.
 */
export function useAirtableListQuery<
  TFields extends Record<string, unknown> = Record<string, unknown>,
>(
  tableKey: TableKey,
  query?: ListRecordsQuery,
  options?: UseAirtableListQueryOptions,
) {
  const { client, isReady } = useAirtable()
  const config = getTableConfig(tableKey)

  return useAirtableQuery<AirtableListQueryData<TFields>>({
    queryKey: airtableKeys.list(tableKey, query),
    enabled: (options?.enabled ?? true) && isReady && !!config,
    staleTime: options?.staleTime,
    refetchInterval: options?.refetchInterval,
    queryFn: async () => {
      if (!client || !config) {
        throw new Error(
          `Airtable not ready or missing table config for ${tableKey}`,
        )
      }
      const res = await client.listRecords<Record<string, unknown>>(
        config.tableId,
        {
          pageSize: config.list?.pageSize,
          maxRecords: config.list?.maxRecords,
          sort: config.list?.sort,
          filterByFormula: config.list?.filterByFormula,
          view: config.views?.default,
          ...query,
        },
      )
      return {
        records: res.records.map((r) =>
          normalizeRecord<TFields>(config, r),
        ),
        offset: res.offset,
      }
    },
  })
}

export type UseAirtableRecordQueryOptions = {
  enabled?: boolean
  staleTime?: number
}

/**
 * Cached single-record query by id.
 */
export function useAirtableRecordQuery<
  TFields extends Record<string, unknown> = Record<string, unknown>,
>(
  tableKey: TableKey,
  recordId: string | null | undefined,
  options?: UseAirtableRecordQueryOptions,
) {
  const { client, isReady } = useAirtable()
  const config = getTableConfig(tableKey)
  const id = recordId?.trim() ?? ''

  return useAirtableQuery<NormalizedRecord<TFields>>({
    queryKey: airtableKeys.detail(tableKey, id),
    enabled: (options?.enabled ?? true) && isReady && !!config && !!id,
    staleTime: options?.staleTime,
    queryFn: async () => {
      if (!client || !config || !id) {
        throw new Error(
          `Airtable not ready, missing config, or empty record id for ${tableKey}`,
        )
      }
      const record = await client.retrieveRecord<Record<string, unknown>>(
        config.tableId,
        id,
      )
      return normalizeRecord<TFields>(config, record)
    },
  })
}
