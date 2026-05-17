/** Airtable field types supported for module table provisioning. */
export type ModuleFieldType =
  | 'singleLineText'
  | 'multilineText'
  | 'checkbox'
  | 'singleSelect'
  | 'multipleRecordLinks'

export interface ModuleFieldBlueprint {
  name: string
  type: ModuleFieldType
  description?: string
  options?: Record<string, unknown>
  /** Link to another table in this module (resolved after that table exists). */
  linkToTableKey?: string
}

export interface ModuleSeedRecord {
  fields: Record<string, unknown>
}

export interface ModuleTableBlueprint {
  /** Matches `tables.ts` entry `key`. */
  tableKey: string
  name: string
  fields: readonly ModuleFieldBlueprint[]
  seedRecords?: readonly ModuleSeedRecord[]
}

export function isPlaceholderTableId(tableId: string): boolean {
  const id = tableId.trim()
  if (!id.startsWith('tbl')) return true
  if (/REPLACE/i.test(id)) return true
  return id.length < 14
}
