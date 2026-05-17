import type { MetaTableSchema } from './metaTypes.ts'
import {
  configKeyFromTableName,
  hookNameFromConfigKey,
  pascalFromConfigKey,
} from './tableCodegen.ts'

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

/**
 * Pasteable React hook with list / get / create / update / delete for one table.
 * Expects matching entries in `tables.ts` and `src/validation/{Pascal}.ts`.
 */
export function generateCrudHookSnippet(
  table: MetaTableSchema,
  options?: { key?: string },
): string {
  const configKey = configKeyFromTableName(table.name, options?.key)
  const pascal = pascalFromConfigKey(configKey)
  const hookName = hookNameFromConfigKey(configKey)
  const createSchema = `${configKey}CreateSchema`
  const patchSchema = `${configKey}PatchSchema`
  const recordType = `${pascal}Record`
  const createType = `${pascal}Create`
  const patchType = `${pascal}Patch`
  const normalizedType = `${pascal}NormalizedRecord`

  return `import { useCallback, useMemo } from 'react'
import { useAirtable } from './useAirtable.ts'
import { getTableConfig } from '../config/tables.ts'
import type { ListRecordsQuery } from '../lib/airtable/types.ts'
import {
  mapConfigToAirtableFields,
  normalizeRecord,
  type NormalizedRecord,
} from '../lib/airtable/mapRecordFields.ts'
import {
  ${createSchema},
  ${patchSchema},
  type ${createType},
  type ${patchType},
  type ${recordType},
} from '../validation/${pascal}.ts'

const TABLE_KEY = ${quote(configKey)} as const

export type ${normalizedType} = NormalizedRecord<${recordType}>

/**
 * CRUD for "${table.name}" (\`${table.id}\`).
 * Requires \`tables.ts\` entry + \`src/validation/${pascal}.ts\`.
 */
export function ${hookName}() {
  const { client, isReady } = useAirtable()
  const config = useMemo(() => getTableConfig(TABLE_KEY), [])

  const ensureReady = useCallback(() => {
    if (!client || !isReady || !config) {
      throw new Error(
        'Airtable not ready or missing table config for ' + TABLE_KEY,
      )
    }
    return { client, config }
  }, [client, isReady, config])

  const list = useCallback(
    async (query?: ListRecordsQuery) => {
      const { client, config } = ensureReady()
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
        ...res,
        records: res.records.map((r) =>
          normalizeRecord<${recordType}>(config, r),
        ),
      }
    },
    [ensureReady],
  )

  const listAll = useCallback(
    async (query?: ListRecordsQuery, options?: { maxTotal?: number; maxPages?: number }) => {
      const { client, config } = ensureReady()
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
        ...result,
        records: result.records.map((r) =>
          normalizeRecord<${recordType}>(config, r),
        ),
      }
    },
    [ensureReady],
  )

  const get = useCallback(
    async (recordId: string): Promise<${normalizedType}> => {
      const { client, config } = ensureReady()
      const record = await client.retrieveRecord<Record<string, unknown>>(
        config.tableId,
        recordId,
      )
      return normalizeRecord<${recordType}>(config, record)
    },
    [ensureReady],
  )

  const create = useCallback(
    async (values: ${createType}): Promise<${normalizedType}> => {
      const { client, config } = ensureReady()
      const parsed = ${createSchema}.safeParse(values)
      if (!parsed.success) throw parsed.error
      const { records } = await client.createRecords(
        config.tableId,
        [
          {
            fields: mapConfigToAirtableFields(
              config,
              parsed.data as Record<string, unknown>,
            ),
          },
        ],
      )
      const created = records[0]
      if (!created) throw new Error('Airtable returned no record')
      return normalizeRecord<${recordType}>(config, created)
    },
    [ensureReady],
  )

  const update = useCallback(
    async (
      recordId: string,
      values: ${patchType},
      options?: { destructive?: boolean },
    ): Promise<${normalizedType}> => {
      const { client, config } = ensureReady()
      const parsed = ${patchSchema}.safeParse(values)
      if (!parsed.success) throw parsed.error
      const fields = mapConfigToAirtableFields(
        config,
        parsed.data as Record<string, unknown>,
      )
      const { records } = await client.updateRecords(
        config.tableId,
        [{ id: recordId, fields }],
        options?.destructive ?? false,
      )
      const updated = records[0]
      if (!updated) throw new Error('Airtable returned no record')
      return normalizeRecord<${recordType}>(config, updated)
    },
    [ensureReady],
  )

  const remove = useCallback(
    async (recordId: string): Promise<void> => {
      const { client, config } = ensureReady()
      await client.deleteRecords(config.tableId, [recordId])
    },
    [ensureReady],
  )

  return {
    tableKey: TABLE_KEY,
    config,
    isReady: isReady && !!config,
    list,
    listAll,
    get,
    create,
    update,
    remove,
  }
}
`
}
