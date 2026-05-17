export type ConfigValueType = 'string' | 'number' | 'boolean' | 'json'

export function normalizeConfigValueType(
  raw: unknown,
): ConfigValueType {
  const s = String(raw ?? 'string').toLowerCase().trim()
  if (s === 'number') return 'number'
  if (s === 'boolean') return 'boolean'
  if (s === 'json') return 'json'
  return 'string'
}

/** Parse a stored Airtable value according to Value type. */
export function parseConfigValue(
  raw: unknown,
  valueType: ConfigValueType,
): unknown {
  if (raw == null) return null
  const text = typeof raw === 'string' ? raw.trim() : String(raw)

  switch (valueType) {
    case 'boolean': {
      const lower = text.toLowerCase()
      if (lower === 'true' || lower === '1' || lower === 'yes') return true
      if (lower === 'false' || lower === '0' || lower === 'no') return false
      return Boolean(text)
    }
    case 'number': {
      const n = Number(text)
      return Number.isFinite(n) ? n : null
    }
    case 'json': {
      if (!text) return null
      try {
        return JSON.parse(text) as unknown
      } catch {
        return null
      }
    }
    default:
      return text
  }
}

export function parseConfigBoolean(
  raw: unknown,
  valueType: ConfigValueType,
  defaultValue: boolean,
): boolean {
  const parsed = parseConfigValue(raw, valueType)
  if (typeof parsed === 'boolean') return parsed
  if (valueType === 'boolean' && typeof parsed === 'string') {
    return parseConfigBoolean(parsed, 'boolean', defaultValue)
  }
  return defaultValue
}
