import type { AirtableDataCache } from './cache/airtableDataCache.ts'
import type { AirtableClient } from './airtableClient.ts'
import {
  collectRecordIdsForDisplayMeta,
  displayFieldMetaForConfigKey,
  isRecordId,
  labelFieldNamesForLinkedTable,
  primaryFieldName,
  type DisplayFieldMeta,
} from './displayFieldsFromSchema.ts'
import { displayValueFromField as displayValue } from './linkFieldDisplay.ts'
import type { AirtableTableConfig } from '../../config/tableTypes.ts'
import type { BaseSchemaResponse, MetaFieldSchema, MetaTableSchema } from './metaTypes.ts'

const BATCH_SIZE = 40
const FETCH_CONCURRENCY = 8

function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

function escapeFormulaString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function labelFromLinkedRecordFields(
  fields: Record<string, unknown>,
  labelFieldNames: readonly string[],
): string | undefined {
  for (const name of labelFieldNames) {
    const label = displayValue(fields[name])
    if (label) return label
  }
  return undefined
}

async function fetchLabelsByFormula(
  client: AirtableClient,
  linkedTableId: string,
  labelFieldNames: readonly string[],
  recordIds: readonly string[],
): Promise<Map<string, string>> {
  const cache = new Map<string, string>()

  for (const batch of chunk(recordIds, BATCH_SIZE)) {
    const formula = `OR(${batch.map((id) => `RECORD_ID()='${escapeFormulaString(id)}'`).join(',')})`
    let offset: string | undefined
    do {
      const res = await client.listRecords<Record<string, unknown>>(linkedTableId, {
        filterByFormula: formula,
        pageSize: 100,
        offset,
      })
      for (const record of res.records) {
        const label = labelFromLinkedRecordFields(record.fields, labelFieldNames)
        if (label) cache.set(record.id, label)
      }
      offset = res.offset
    } while (offset)
  }

  return cache
}

async function fetchLabelsByRecordId(
  client: AirtableClient,
  linkedTableId: string,
  labelFieldNames: readonly string[],
  recordIds: readonly string[],
): Promise<Map<string, string>> {
  const cache = new Map<string, string>()

  for (let i = 0; i < recordIds.length; i += FETCH_CONCURRENCY) {
    const slice = recordIds.slice(i, i + FETCH_CONCURRENCY)
    await Promise.all(
      slice.map(async (id) => {
        try {
          const record = await client.getRecord<Record<string, unknown>>(
            linkedTableId,
            id,
          )
          const label = labelFromLinkedRecordFields(record.fields, labelFieldNames)
          if (label) cache.set(id, label)
        } catch {
          /* missing or inaccessible linked row */
        }
      }),
    )
  }

  return cache
}

/**
 * Map linked record id → display value for one linked table.
 */
export async function resolveLinkedRecordLabels(
  client: AirtableClient,
  schema: BaseSchemaResponse,
  linkedTableId: string,
  recordIds: readonly string[],
  lookupFields: readonly MetaFieldSchema[] = [],
  dataCache?: AirtableDataCache,
): Promise<Map<string, string>> {
  const unique = [...new Set(recordIds.filter(isRecordId))]
  if (unique.length === 0) return new Map()

  const linkedTable = schema.tables.find((t) => t.id === linkedTableId)
  if (!linkedTable) return new Map()

  const labelFieldNames =
    lookupFields.length > 0
      ? labelFieldNamesForLinkedTable(linkedTable, lookupFields)
      : [primaryFieldName(linkedTable)]

  const result = new Map<string, string>()
  const persisted = dataCache?.getLinkedLabels(linkedTableId, labelFieldNames) ?? {}
  const missing: string[] = []

  for (const id of unique) {
    const label = persisted[id]
    if (label) result.set(id, label)
    else missing.push(id)
  }

  if (missing.length > 0) {
    const fetched = await fetchLabelsByFormula(
      client,
      linkedTableId,
      labelFieldNames,
      missing,
    )

    const stillMissing = missing.filter((id) => !fetched.has(id))
    if (stillMissing.length > 0) {
      const byId = await fetchLabelsByRecordId(
        client,
        linkedTableId,
        labelFieldNames,
        stillMissing,
      )
      for (const [id, label] of byId) fetched.set(id, label)
    }

    for (const [id, label] of fetched) result.set(id, label)
    dataCache?.mergeLinkedLabels(linkedTableId, labelFieldNames, fetched)
  }

  return result
}

export type LinkedLabelResolver = (
  meta: DisplayFieldMeta,
  recordIds: readonly string[],
) => Promise<Map<string, string>>

/** Build a resolver that caches per linked table id + label field set. */
export function createLinkedLabelResolver(
  client: AirtableClient,
  schema: BaseSchemaResponse,
  dataCache?: AirtableDataCache,
): LinkedLabelResolver {
  const sessionCaches = new Map<string, Map<string, string>>()

  return async (meta, recordIds) => {
    const cacheKey = `${meta.linkedTableId}:${meta.lookupFields.map((f) => f.id).join(',')}`
    const existing = sessionCaches.get(cacheKey) ?? new Map<string, string>()
    const missing = recordIds.filter(isRecordId).filter((id) => !existing.has(id))
    if (missing.length > 0) {
      const fetched = await resolveLinkedRecordLabels(
        client,
        schema,
        meta.linkedTableId,
        missing,
        meta.lookupFields,
        dataCache,
      )
      for (const [id, label] of fetched) existing.set(id, label)
    }
    sessionCaches.set(cacheKey, existing)
    return existing
  }
}

export function applyLabelCacheToFieldValue(
  value: unknown,
  cache: ReadonlyMap<string, string>,
): unknown {
  if (typeof value === 'string' && isRecordId(value)) {
    return cache.get(value) ?? undefined
  }
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === 'string' && isRecordId(item) ? cache.get(item) : item,
      )
      .filter((item) => item != null && item !== '')
  }
  return value
}

export async function buildLinkFieldLabelCaches(
  client: AirtableClient,
  schema: BaseSchemaResponse,
  buildingTable: MetaTableSchema,
  tableConfig: AirtableTableConfig,
  rawRecords: readonly { fields: Record<string, unknown> }[],
  linkConfigKeys: readonly string[],
  dataCache?: AirtableDataCache,
): Promise<Map<string, Map<string, string>>> {
  const resolveLabels = createLinkedLabelResolver(client, schema, dataCache)
  const caches = new Map<string, Map<string, string>>()

  for (const configKey of linkConfigKeys) {
    const configuredName = tableConfig.fields[configKey]
    const meta = displayFieldMetaForConfigKey(
      buildingTable,
      configKey,
      configuredName,
    )
    if (!meta) continue

    const ids = rawRecords.flatMap((r) =>
      collectRecordIdsForDisplayMeta(r.fields, meta, configuredName),
    )
    if (ids.length === 0) continue

    caches.set(configKey, await resolveLabels(meta, ids))
  }

  return caches
}
