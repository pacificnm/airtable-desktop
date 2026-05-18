import type { MetaFieldSchema } from './metaTypes.ts'
import { formatSelectChoicesSummary } from './fieldOptions.ts'

/** Short human-readable summary of type-specific `options` from the Meta API. */
export function summarizeFieldOptions(field: MetaFieldSchema): string {
  const { type, options } = field
  if (!options || typeof options !== 'object') return '—'

  const o = options as Record<string, unknown>

  switch (type) {
    case 'singleSelect':
    case 'multipleSelects':
      return formatSelectChoicesSummary(field)
    case 'multipleRecordLinks':
      return [
        o.linkedTableId && `→ table ${String(o.linkedTableId)}`,
        o.prefersSingleRecordLink === true && 'single link',
      ]
        .filter(Boolean)
        .join(' · ') || '—'
    case 'number':
    case 'percent':
    case 'currency':
      return o.precision != null ? `precision ${o.precision}` : '—'
    case 'rating':
      return o.max != null ? `max ${o.max}` : '—'
    case 'formula':
      return o.isValid === false ? 'invalid formula' : 'formula'
    case 'rollup':
    case 'lookup':
    case 'multipleLookupValues':
    case 'count':
      return o.isValid === false ? 'invalid / broken ref' : 'linked field'
    case 'date':
    case 'dateTime':
      return (o.dateFormat as { name?: string } | undefined)?.name ?? '—'
    default:
      return Object.keys(o).length > 0 ? `${Object.keys(o).length} option(s)` : '—'
  }
}

export function fieldTypeLabel(type: string): string {
  return type.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
}
