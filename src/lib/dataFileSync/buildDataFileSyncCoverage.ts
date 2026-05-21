import type { AirtableTableConfig } from '@/config/tableTypes.ts'
import type { MetaFieldSnapshot } from '@/config/tableTypes.ts'
import type { DataFileFieldMapping, DataFileMapping } from './types.ts'

/** How a row relates to data-file sync for a table. */
export type DataFileSyncCoverageStatus =
  | 'synced'
  | 'matchOnly'
  | 'lookupDerived'
  | 'upsertKey'
  | 'csvUnmapped'
  | 'airtableNoSource'
  | 'notWritable'

export interface DataFileSyncCoverageRow {
  csvColumn: string
  airtableField: string
  airtableLabel: string
  airtableType: string
  syncStatus: DataFileSyncCoverageStatus
  detail: string
}

export interface BuildDataFileSyncCoverageContext {
  mapping: DataFileMapping
  table: AirtableTableConfig
  byCsv: Map<string, DataFileFieldMapping>
  byAirtable: Map<string, DataFileFieldMapping>
  metaType: (configKey: string) => string
  isWritableField: (configKey: string) => boolean
}

export interface BuildDataFileSyncCoverageOptions {
  mapping: DataFileMapping
  table: AirtableTableConfig
  fieldsMeta?: readonly MetaFieldSnapshot[]
  csvColumns?: readonly string[]
  /**
   * When omitted, uses meta types: formula/system → notWritable,
   * multipleLookupValues → lookupDerived.
   */
  isWritableField?: (configKey: string, ctx: BuildDataFileSyncCoverageContext) => boolean
  /** Override status for a mapped field (CSV row). */
  resolveMappedFieldStatus?: (
    field: DataFileFieldMapping,
    ctx: BuildDataFileSyncCoverageContext,
  ) => { status: DataFileSyncCoverageStatus; detail: string } | undefined
  /** Override status for an Airtable field with no mapping row yet. */
  resolveUnmappedAirtableField?: (
    configKey: string,
    ctx: BuildDataFileSyncCoverageContext,
  ) => { status: DataFileSyncCoverageStatus; detail: string } | undefined
}

const SYSTEM_META_TYPES = new Set([
  'formula',
  'lastModifiedTime',
  'lastModifiedBy',
  'createdTime',
  'autoNumber',
  'button',
  'count',
  'rollup',
  'externalSyncSource',
])

function defaultIsWritable(
  configKey: string,
  ctx: BuildDataFileSyncCoverageContext,
): boolean {
  const type = ctx.metaType(configKey)
  if (SYSTEM_META_TYPES.has(type)) return false
  if (type === 'multipleLookupValues' || type === 'lookup') return false
  return true
}

function defaultMappedStatus(
  field: DataFileFieldMapping,
  ctx: BuildDataFileSyncCoverageContext,
): { status: DataFileSyncCoverageStatus; detail: string } {
  if (field.airtableField === ctx.mapping.upsertKey.airtableField) {
    return {
      status: 'upsertKey',
      detail: 'Matches existing records by this value; not overwritten on update.',
    }
  }
  if (field.writeOnSync === false) {
    return {
      status: 'matchOnly',
      detail: field.note ?? 'Not written on sync.',
    }
  }
  if (!ctx.isWritableField(field.airtableField)) {
    return {
      status: 'notWritable',
      detail: `Airtable field type "${ctx.metaType(field.airtableField)}" cannot be written from sync.`,
    }
  }
  return {
    status: 'synced',
    detail: field.note ?? 'Written on create/update when CSV cell has a value.',
  }
}

function defaultUnmappedAirtable(
  configKey: string,
  ctx: BuildDataFileSyncCoverageContext,
): { status: DataFileSyncCoverageStatus; detail: string } {
  const type = ctx.metaType(configKey)
  if (SYSTEM_META_TYPES.has(type)) {
    return {
      status: 'notWritable',
      detail: 'System or formula field — not populated from data file.',
    }
  }
  if (type === 'multipleLookupValues' || type === 'lookup') {
    return {
      status: 'lookupDerived',
      detail: 'Lookup field — populated when source links are set.',
    }
  }
  if (!ctx.isWritableField(configKey)) {
    return {
      status: 'notWritable',
      detail: `Field type "${type}" is not supported for data-file sync writes.`,
    }
  }
  return {
    status: 'airtableNoSource',
    detail: 'No CSV column mapped for this field.',
  }
}

function mappingByCsvColumn(
  mapping: DataFileMapping,
): Map<string, DataFileFieldMapping> {
  const map = new Map<string, DataFileFieldMapping>()
  for (const field of mapping.fields) {
    map.set(field.csvColumn, field)
  }
  return map
}

function mappingByAirtableField(
  mapping: DataFileMapping,
): Map<string, DataFileFieldMapping> {
  const map = new Map<string, DataFileFieldMapping>()
  for (const field of mapping.fields) {
    map.set(field.airtableField, field)
  }
  return map
}

/**
 * Compares CSV columns (optional), mapping fields, and table schema fields.
 */
export function buildDataFileSyncCoverage(
  options: BuildDataFileSyncCoverageOptions,
): DataFileSyncCoverageRow[] {
  const { mapping, table, fieldsMeta, csvColumns } = options
  const byCsv = mappingByCsvColumn(mapping)
  const byAirtable = mappingByAirtableField(mapping)
  const metaType = (configKey: string): string =>
    fieldsMeta?.find((f) => f.configKey === configKey)?.type ?? 'unknown'

  const ctx: BuildDataFileSyncCoverageContext = {
    mapping,
    table,
    byCsv,
    byAirtable,
    metaType,
    isWritableField: (key) =>
      (options.isWritableField ?? defaultIsWritable)(key, ctx),
  }

  const rows: DataFileSyncCoverageRow[] = []
  const coveredAirtable = new Set<string>()

  const csvList = csvColumns ?? [
    ...new Set(mapping.fields.map((f) => f.csvColumn)),
  ]

  for (const csvColumn of csvList) {
    const field = byCsv.get(csvColumn)
    if (field) {
      const resolved =
        options.resolveMappedFieldStatus?.(field, ctx) ??
        defaultMappedStatus(field, ctx)
      coveredAirtable.add(field.airtableField)
      rows.push({
        csvColumn,
        airtableField: field.airtableField,
        airtableLabel:
          field.airtableLabel ??
          table.fields[field.airtableField] ??
          field.airtableField,
        airtableType: metaType(field.airtableField),
        syncStatus: resolved.status,
        detail: resolved.detail,
      })
      continue
    }

    rows.push({
      csvColumn,
      airtableField: '—',
      airtableLabel: '—',
      airtableType: '—',
      syncStatus: 'csvUnmapped',
      detail: 'Column is read from the file but not mapped to any Airtable field.',
    })
  }

  for (const configKey of Object.keys(table.fields)) {
    if (coveredAirtable.has(configKey)) continue
    if (byAirtable.has(configKey)) continue

    const resolved =
      options.resolveUnmappedAirtableField?.(configKey, ctx) ??
      defaultUnmappedAirtable(configKey, ctx)

    rows.push({
      csvColumn: '—',
      airtableField: configKey,
      airtableLabel: table.fields[configKey] ?? configKey,
      airtableType: metaType(configKey),
      syncStatus: resolved.status,
      detail: resolved.detail,
    })
  }

  return sortCoverageRows(rows)
}

export function dataFileSyncCoverageSummary(
  rows: readonly DataFileSyncCoverageRow[],
): Record<DataFileSyncCoverageStatus, number> {
  const counts: Record<DataFileSyncCoverageStatus, number> = {
    synced: 0,
    matchOnly: 0,
    lookupDerived: 0,
    upsertKey: 0,
    csvUnmapped: 0,
    airtableNoSource: 0,
    notWritable: 0,
  }
  for (const row of rows) {
    counts[row.syncStatus] += 1
  }
  return counts
}

const STATUS_SORT_ORDER: Record<DataFileSyncCoverageStatus, number> = {
  synced: 0,
  upsertKey: 1,
  matchOnly: 2,
  lookupDerived: 3,
  csvUnmapped: 4,
  airtableNoSource: 5,
  notWritable: 6,
}

function sortCoverageRows(
  rows: DataFileSyncCoverageRow[],
): DataFileSyncCoverageRow[] {
  return rows.sort((a, b) => {
    const d = STATUS_SORT_ORDER[a.syncStatus] - STATUS_SORT_ORDER[b.syncStatus]
    if (d !== 0) return d
    return a.csvColumn.localeCompare(b.csvColumn)
  })
}
