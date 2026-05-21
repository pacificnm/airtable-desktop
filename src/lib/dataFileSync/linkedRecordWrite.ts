import type { AirtableTableConfig } from '@/config/tables.ts'
import { linkFieldMetaForWriteTarget } from '@/lib/airtable/displayFieldsFromSchema.ts'
import { mapConfigToAirtableFields } from '@/lib/airtable/mapRecordFields.ts'
import type { MetaTableSchema } from '@/lib/airtable/metaTypes.ts'
import {
  isAirtableRecordId,
  parseLinkedRecordIds,
} from '../../../modules/roles/lib/linkedRecords.ts'
import type { DataFileFieldMapping, DataFileMapping } from './types.ts'

export interface PlanLinkedTableIds {
  readonly [tableKey: string]: string | undefined
}

/** Normalize plan/API values to Airtable linked-record write payload (`rec…` ids). */
export function linkedRecordIdsForDataFileWrite(
  value: unknown,
): string[] | undefined {
  const ids = parseLinkedRecordIds(value)
  if (ids.length > 0) return ids
  if (typeof value === 'string' && isAirtableRecordId(value)) return [value]
  return undefined
}

function linkedFieldMapping(
  mapping: DataFileMapping,
  configKey: string,
): DataFileFieldMapping | undefined {
  return mapping.fields.find(
    (field) => field.airtableField === configKey && field.type === 'linkedRecord',
  )
}

/**
 * Map sync plan fields (config keys) to Airtable PATCH/POST field names.
 * Linked-record mappings always write to the backing link column, never a lookup.
 */
export function planConfigFieldsToAirtableWritePayload(
  tableConfig: AirtableTableConfig,
  mapping: DataFileMapping,
  configFields: Record<string, unknown>,
  tableMeta: MetaTableSchema | undefined,
  linkedTableIds: PlanLinkedTableIds = {},
): Record<string, unknown> {
  const passthrough: Record<string, unknown> = {}
  const out: Record<string, unknown> = {}

  for (const [configKey, value] of Object.entries(configFields)) {
    if (value === undefined) continue

    const fieldMapping = linkedFieldMapping(mapping, configKey)
    if (!fieldMapping?.link) {
      passthrough[configKey] = value
      continue
    }

    const ids = linkedRecordIdsForDataFileWrite(value)
    if (!ids?.length) {
      throw new Error(
        `Sync field "${configKey}" must be linked record ids (rec…); got ${JSON.stringify(value)}.`,
      )
    }

    if (!tableMeta) {
      throw new Error(
        'Cannot apply linked-field sync without base schema. Connect to Airtable and try again.',
      )
    }

    const meta = linkFieldMetaForWriteTarget(tableMeta, configKey, {
      configuredAirtableName: tableConfig.fields[configKey],
      linkedTableId: linkedTableIds[fieldMapping.link.tableKey],
      linkFieldId: fieldMapping.link.linkFieldId,
    })

    if (!meta) {
      const configured = tableConfig.fields[configKey] ?? configKey
      throw new Error(
        `Could not find a writable link field on ${tableConfig.tableName} for "${configured}" (links to ${fieldMapping.link.tableKey}). Run Developer → Modules → Sync schema from Airtable.`,
      )
    }

    out[meta.linkField.name] = ids
  }

  const safePassthrough = tableMeta
    ? omitScalarWritesToLinkColumns(tableMeta, tableConfig, passthrough, out)
    : passthrough

  return { ...mapConfigToAirtableFields(tableConfig, safePassthrough), ...out }
}

/** Never send plain text to Airtable link columns (e.g. City name instead of rec ids). */
function omitScalarWritesToLinkColumns(
  tableMeta: MetaTableSchema,
  tableConfig: AirtableTableConfig,
  passthrough: Record<string, unknown>,
  out: Record<string, unknown>,
): Record<string, unknown> {
  const kept: Record<string, unknown> = {}
  for (const [configKey, value] of Object.entries(passthrough)) {
    const meta = linkFieldMetaForWriteTarget(tableMeta, configKey, {
      configuredAirtableName: tableConfig.fields[configKey],
    })
    if (!meta) {
      kept[configKey] = value
      continue
    }
    const ids = linkedRecordIdsForDataFileWrite(value)
    if (ids?.length) {
      out[meta.linkField.name] = ids
    }
  }
  return kept
}
