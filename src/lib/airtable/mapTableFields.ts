import type { MetaFieldSchema } from './metaTypes.ts'

/** camelCase config key from an Airtable column name. */
export function fieldNameToConfigKey(fieldName: string): string {
  const cleaned = fieldName.replace(/^From field:\s*/i, '').trim()
  const base = cleaned
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
  if (!base) return 'field'
  return base.charAt(0).toLowerCase() + base.slice(1)
}

function uniqueConfigKey(preferred: string, usedKeys: Set<string>): string {
  let key = preferred
  let n = 2
  while (usedKeys.has(key)) {
    key = `${preferred}${n}`
    n += 1
  }
  usedKeys.add(key)
  return key
}

/**
 * One config key per Airtable column (camelCase), value = exact Airtable field name.
 */
export function buildCompleteFieldMap(
  fields: readonly MetaFieldSchema[],
): Record<string, string> {
  const result: Record<string, string> = {}
  const usedKeys = new Set<string>()

  for (const field of fields) {
    const key = uniqueConfigKey(fieldNameToConfigKey(field.name), usedKeys)
    result[key] = field.name
  }

  return result
}

export function orderedFieldKeys(fields: Record<string, string>): string[] {
  return Object.keys(fields).sort((a, b) => a.localeCompare(b))
}
