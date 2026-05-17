import type { AirtableTableConfig } from '../../config/tables.ts'
import type { AirtableRecord } from './types.ts'

/** Config keys → Airtable field names for create/update payloads. */
export function mapConfigToAirtableFields(
  config: AirtableTableConfig,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [configKey, value] of Object.entries(values)) {
    if (value === undefined) continue
    const airtableName = config.fields[configKey]
    if (airtableName) out[airtableName] = value
  }
  return out
}

/** Airtable field names → config keys (for normalizing API responses). */
export function mapAirtableToConfigFields<T extends Record<string, unknown>>(
  config: AirtableTableConfig,
  fields: Record<string, unknown>,
): T {
  const byAirtableName = new Map(
    Object.entries(config.fields).map(([configKey, airtableName]) => [
      airtableName,
      configKey,
    ]),
  )
  const out: Record<string, unknown> = {}
  for (const [airtableName, value] of Object.entries(fields)) {
    const configKey = byAirtableName.get(airtableName)
    if (configKey) out[configKey] = value
  }
  return out as T
}

export interface NormalizedRecord<TFields> {
  id: string
  createdTime: string
  fields: TFields
}

export function normalizeRecord<TFields extends Record<string, unknown>>(
  config: AirtableTableConfig,
  record: AirtableRecord<Record<string, unknown>>,
): NormalizedRecord<TFields> {
  return {
    id: record.id,
    createdTime: record.createdTime,
    fields: mapAirtableToConfigFields<TFields>(config, record.fields),
  }
}
