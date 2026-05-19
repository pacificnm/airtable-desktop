/**
 * Shared types for module-defined data-file → Airtable mappings.
 * Concrete mappings live in each module (e.g. `module-repos/space/lib/dataFileMapping.ts`).
 */

export type DataFileFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'singleSelect'
  | 'linkedRecord'

export interface DataFileLinkLookup {
  /** `key` in the linked module's tables.ts (e.g. 'building'). */
  tableKey: string
  /** Airtable column on the linked record matched against the CSV value. */
  matchField: string
}

export interface DataFileFieldMapping {
  /** Airtable column key from the target module's tables.ts `fields`. */
  airtableField: string
  /** Human label shown in the mapping panel. */
  airtableLabel?: string
  /** CSV header to read. */
  csvColumn: string
  type: DataFileFieldType
  /** Required only for `linkedRecord` rows. */
  link?: DataFileLinkLookup
  /**
   * When true (default), an empty/whitespace cell in the CSV is treated as
   * "leave as is" rather than clearing the Airtable column.
   */
  skipIfBlank?: boolean
  /** Free-form note shown in the UI to explain the mapping. */
  note?: string
}

export interface DataFileMapping {
  /** Stable id (in case multiple file shapes exist for one module). */
  id: string
  /** Friendly label shown in UI. */
  label: string
  /** Which Airtable table key this mapping targets. */
  tableKey: string
  /** Unique key used to find an existing record (or create one). */
  upsertKey: {
    airtableField: string
    csvColumn: string
  }
  /** CSV columns required for a row to be syncable. */
  required: readonly string[]
  fields: readonly DataFileFieldMapping[]
}
