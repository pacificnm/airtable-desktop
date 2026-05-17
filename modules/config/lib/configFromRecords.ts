import type { NormalizedRecord } from '../../../src/lib/airtable/mapRecordFields.ts'
import {
  normalizeConfigValueType,
  parseConfigValue,
  type ConfigValueType,
} from './parseConfigValue.ts'

export interface ConfigEntry {
  id: string
  key: string
  value: unknown
  valueType: ConfigValueType
  label?: string
  description?: string
  module?: string
  active: boolean
}

type ConfigFields = {
  key?: string
  value?: unknown
  valueType?: unknown
  label?: string
  description?: string
  module?: string
  active?: unknown
}

export function recordToConfigEntry(
  record: NormalizedRecord<ConfigFields>,
): ConfigEntry | null {
  const key = record.fields.key?.trim()
  if (!key) return null

  const valueType = normalizeConfigValueType(record.fields.valueType)
  const activeRaw = record.fields.active
  const active =
    activeRaw === undefined ||
    activeRaw === null ||
    activeRaw === true ||
    String(activeRaw).toLowerCase() === 'true'

  return {
    id: record.id,
    key,
    value: parseConfigValue(record.fields.value, valueType),
    valueType,
    label: record.fields.label?.trim() || undefined,
    description: record.fields.description?.trim() || undefined,
    module: record.fields.module?.trim() || undefined,
    active,
  }
}

export function configEntriesFromRecords(
  records: readonly NormalizedRecord<ConfigFields>[],
): ConfigEntry[] {
  return records
    .map(recordToConfigEntry)
    .filter((e): e is ConfigEntry => e !== null)
}

export function configMapFromEntries(
  entries: readonly ConfigEntry[],
  options?: { activeOnly?: boolean },
): Map<string, unknown> {
  const activeOnly = options?.activeOnly ?? true
  const map = new Map<string, unknown>()
  for (const entry of entries) {
    if (activeOnly && !entry.active) continue
    map.set(entry.key, entry.value)
  }
  return map
}

export function getConfigValueFromEntries(
  entries: readonly ConfigEntry[],
  key: string,
  options?: { activeOnly?: boolean },
): unknown {
  const activeOnly = options?.activeOnly ?? true
  const match = entries.find((e) => e.key === key)
  if (!match) return undefined
  if (activeOnly && !match.active) return undefined
  return match.value
}
