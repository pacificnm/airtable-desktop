import { isRecordId } from './displayFieldsFromSchema.ts'

/** Turn an Airtable cell value into display text; resolve `rec…` via cache when provided. */
export function displayValueFromField(
  value: unknown,
  labelCache?: ReadonlyMap<string, string>,
): string | undefined {
  if (value == null || value === '') return undefined

  if (typeof value === 'string') {
    const text = value
    if (isRecordId(text)) {
      return labelCache?.get(text)
    }
    const trimmed = text.trim()
    return trimmed || undefined
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => displayValueFromField(item, labelCache))
      .filter((part): part is string => part != null && part.length > 0)
    return parts.length > 0 ? parts.join(', ') : undefined
  }

  if (typeof value === 'object' && value !== null && 'name' in value) {
    return displayValueFromField((value as { name?: unknown }).name, labelCache)
  }

  return undefined
}

/** Prefer normalized/lookup value; fall back to resolved link field labels. */
export function resolvedLinkDisplayValue(
  normalizedValue: unknown,
  rawLinkValue: unknown,
  labelCache: ReadonlyMap<string, string>,
): string | undefined {
  return resolvedLinkDisplayValueFromSources(
    normalizedValue,
    [rawLinkValue],
    labelCache,
  )
}

/** Try normalized value, then each raw source (link column, lookup columns, etc.). */
export function resolvedLinkDisplayValueFromSources(
  normalizedValue: unknown,
  rawValues: readonly unknown[],
  labelCache: ReadonlyMap<string, string>,
): string | undefined {
  const fromNormalized = displayValueFromField(normalizedValue, labelCache)
  if (fromNormalized) return fromNormalized

  for (const raw of rawValues) {
    const fromRaw = displayValueFromField(raw, labelCache)
    if (fromRaw) return fromRaw
  }

  return undefined
}
