import type { AirtableTableConfig } from '@/config/tableTypes.ts'
import type { DataFileFieldMapping, DataFileMapping } from './types.ts'

export type DataFileMappingValidationCode =
  | 'TABLE_NOT_FOUND'
  | 'UPSERT_FIELD_MISSING'
  | 'FIELD_NOT_ON_TABLE'
  | 'DUPLICATE_AIRTABLE_FIELD'
  | 'LINKED_RECORD_MISSING_LINK'
  | 'REQUIRED_CSV_UNMAPPED'
  | 'UNKNOWN_CSV_COLUMN'

export interface DataFileMappingValidationIssue {
  code: DataFileMappingValidationCode
  message: string
}

export interface ValidateDataFileMappingOptions {
  /** When set, flags mapping fields whose csvColumn is not in this list. */
  knownCsvColumns?: ReadonlySet<string>
}

/**
 * Validates a {@link DataFileMapping} against a module `tables.ts` entry.
 * Intended for CI and Developer → Data file mappings.
 */
export function validateDataFileMapping(
  mapping: DataFileMapping,
  table: AirtableTableConfig | undefined,
  options: ValidateDataFileMappingOptions = {},
): DataFileMappingValidationIssue[] {
  const issues: DataFileMappingValidationIssue[] = []

  if (!table) {
    issues.push({
      code: 'TABLE_NOT_FOUND',
      message: `No table with key "${mapping.tableKey}" in registry entry.`,
    })
    return issues
  }

  const fieldKeys = new Set(Object.keys(table.fields))

  if (!fieldKeys.has(mapping.upsertKey.airtableField)) {
    issues.push({
      code: 'UPSERT_FIELD_MISSING',
      message: `Upsert field "${mapping.upsertKey.airtableField}" is not on table "${mapping.tableKey}".`,
    })
  }

  const mappedCsv = new Set(
    mapping.fields.map((f) => f.csvColumn).concat([mapping.upsertKey.csvColumn]),
  )

  for (const required of mapping.required) {
    if (!mappedCsv.has(required)) {
      issues.push({
        code: 'REQUIRED_CSV_UNMAPPED',
        message: `Required CSV column "${required}" is not mapped or used as upsert key.`,
      })
    }
  }

  const airtableSeen = new Set<string>()

  for (const field of mapping.fields) {
    validateField(field, fieldKeys, options, issues)

    if (airtableSeen.has(field.airtableField)) {
      issues.push({
        code: 'DUPLICATE_AIRTABLE_FIELD',
        message: `Airtable field "${field.airtableField}" is mapped more than once.`,
      })
    }
    airtableSeen.add(field.airtableField)
  }

  return issues
}

function validateField(
  field: DataFileFieldMapping,
  fieldKeys: Set<string>,
  options: ValidateDataFileMappingOptions,
  issues: DataFileMappingValidationIssue[],
): void {
  if (!fieldKeys.has(field.airtableField)) {
    issues.push({
      code: 'FIELD_NOT_ON_TABLE',
      message: `Mapped Airtable field "${field.airtableField}" (CSV ${field.csvColumn}) is not on the table.`,
    })
  }

  if (field.type === 'linkedRecord' && !field.link) {
    issues.push({
      code: 'LINKED_RECORD_MISSING_LINK',
      message: `Linked record field "${field.airtableField}" is missing link lookup config.`,
    })
  }

  if (
    options.knownCsvColumns &&
    !options.knownCsvColumns.has(field.csvColumn)
  ) {
    issues.push({
      code: 'UNKNOWN_CSV_COLUMN',
      message: `CSV column "${field.csvColumn}" is not in the known column list for this data source.`,
    })
  }
}
