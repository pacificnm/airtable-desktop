import type { AirtableTableConfig } from '../../../src/config/tables.ts'
import { mapConfigToAirtableFields } from '../../../src/lib/airtable/mapRecordFields.ts'
import type { ConfigEntry } from './configFromRecords.ts'
import type { ConfigValueType } from './parseConfigValue.ts'

export interface ConfigEntryFormValues {
  key: string
  value: string
  valueType: ConfigValueType
  label: string
  description: string
  module: string
  active: boolean
}

export const CONFIG_VALUE_TYPE_OPTIONS: readonly {
  value: ConfigValueType
  label: string
}[] = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'json', label: 'JSON' },
]

export function emptyConfigFormValues(): ConfigEntryFormValues {
  return {
    key: '',
    value: '',
    valueType: 'string',
    label: '',
    description: '',
    module: '',
    active: true,
  }
}

export function configEntryToFormValues(entry: ConfigEntry): ConfigEntryFormValues {
  return {
    key: entry.key,
    value: formatConfigValueForForm(entry.value, entry.valueType),
    valueType: entry.valueType,
    label: entry.label ?? '',
    description: entry.description ?? '',
    module: entry.module ?? '',
    active: entry.active,
  }
}

export function formatConfigValueForForm(
  value: unknown,
  valueType: ConfigValueType,
): string {
  if (value == null) return ''
  if (valueType === 'json') {
    if (typeof value === 'string') return value
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }
  if (valueType === 'boolean') {
    return value === true || String(value).toLowerCase() === 'true'
      ? 'true'
      : 'false'
  }
  return String(value)
}

export function configFormValuesToAirtableFields(
  config: AirtableTableConfig,
  values: ConfigEntryFormValues,
): Record<string, unknown> {
  return mapConfigToAirtableFields(config, {
    key: values.key.trim(),
    value: values.value,
    valueType: values.valueType,
    label: values.label.trim() || undefined,
    description: values.description.trim() || undefined,
    module: values.module.trim() || undefined,
    active: values.active,
  })
}

export function validateConfigFormValues(
  values: ConfigEntryFormValues,
): string | null {
  if (!values.key.trim()) return 'Key is required.'
  if (values.valueType === 'json' && values.value.trim()) {
    try {
      JSON.parse(values.value)
    } catch {
      return 'Value must be valid JSON for type JSON.'
    }
  }
  if (values.valueType === 'number' && values.value.trim()) {
    const n = Number(values.value)
    if (!Number.isFinite(n)) return 'Value must be a valid number.'
  }
  return null
}
