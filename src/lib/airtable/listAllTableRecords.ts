import type { AirtableTableConfig } from '../../config/tables.ts'
import type { AirtableClient } from './airtableClient.ts'
import {
  normalizeRecord,
  type NormalizedRecord,
} from './mapRecordFields.ts'
import type {
  ListAllRecordsOptions,
  ListAllRecordsResult,
  ListRecordsQuery,
} from './types.ts'

export type ListAllTableRecordsResult<
  TFields extends Record<string, unknown> = Record<string, unknown>,
> = {
  records: NormalizedRecord<TFields>[]
  truncated: boolean
  pagesFetched: number
}

/**
 * `listAllRecords` for a `tables.ts` entry — applies list defaults and normalizes fields.
 */
export async function listAllTableRecords<
  TFields extends Record<string, unknown> = Record<string, unknown>,
>(
  client: AirtableClient,
  config: AirtableTableConfig,
  query?: ListRecordsQuery,
  options?: Omit<ListAllRecordsOptions, keyof ListRecordsQuery>,
): Promise<ListAllTableRecordsResult<TFields>> {
  const result = await client.listAllRecords<Record<string, unknown>>(
    config.tableId,
    {
      pageSize: config.list?.pageSize,
      sort: config.list?.sort,
      filterByFormula: config.list?.filterByFormula,
      view: config.views?.default,
      maxRecords: config.list?.maxRecords,
      ...query,
      ...options,
    },
  )

  return {
    records: result.records.map((r) =>
      normalizeRecord<TFields>(config, r),
    ),
    truncated: result.truncated,
    pagesFetched: result.pagesFetched,
  }
}

export type { ListAllRecordsResult }
