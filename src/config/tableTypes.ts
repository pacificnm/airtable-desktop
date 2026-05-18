import type { AppView } from '../components/main/appView.ts'
import type { SortParam } from '../lib/airtable/types.ts'

export type TableFieldMap = Record<string, string>

export interface TableViewMap {
  default?: string
  /** Airtable grid view name (table UI). */
  grid?: string
  /** Airtable view for card UI (falls back to `grid`, then `default`). */
  card?: string
  kanban?: string
  /** @deprecated Prefer `grid`. */
  table?: string
}

export interface TableListConfig {
  pageSize?: number
  maxRecords?: number
  sort?: SortParam[]
  filterByFormula?: string
}

export interface FieldValidationOverride {
  required?: boolean
}

export interface TableColumnConfig {
  field: string
  label?: string
  hidden?: boolean
}

/**
 * Snapshot of one Airtable field from the Meta API (written to `tables.meta.ts` on schema sync).
 * Includes `options` (select colors, link targets, rating max, etc.).
 */
export interface MetaFieldSnapshot {
  id: string
  /** camelCase key used in app config / `tables.ts` `fields` map */
  configKey: string
  name: string
  type: string
  description?: string
  options?: Record<string, unknown>
}

export interface AirtableTableConfig {
  key: string
  label: string
  tableId: string
  tableName?: string
  fields: TableFieldMap
  views?: TableViewMap
  list?: TableListConfig
  columns?: TableColumnConfig[]
  primaryField?: string
  screens?: readonly AppView[]
  validation?: Partial<Record<string, FieldValidationOverride>>
}

export type AirtableTableEntry = AirtableTableConfig

export type TableKey = string
