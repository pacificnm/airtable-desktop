const MAX_LEN = 120

function truncate(text: string): string {
  if (text.length <= MAX_LEN) return text
  return `${text.slice(0, MAX_LEN)}…`
}

/** Display-friendly cell text for Airtable field values (normalized config keys). */
export function formatCellValue(value: unknown): string {
  if (value == null || value === '') return '—'
  if (typeof value === 'string') return truncate(value)
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '—'
    return truncate(
      value
        .map((item) =>
          typeof item === 'object' && item !== null && 'name' in item
            ? String((item as { name?: string }).name ?? item)
            : String(item),
        )
        .join(', '),
    )
  }
  if (typeof value === 'object') {
    try {
      return truncate(JSON.stringify(value))
    } catch {
      return '—'
    }
  }
  return truncate(String(value))
}
