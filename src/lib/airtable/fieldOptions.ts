import type { MetaFieldSchema } from './metaTypes.ts'

/** Airtable single/multi select choice from the Meta API `options.choices` array. */
export interface SelectChoice {
  id: string
  name: string
  /** e.g. `greenBright`, `blueLight2` — omitted when colors are disabled on the field. */
  color?: string
}

const SELECT_FIELD_TYPES = new Set(['singleSelect', 'multipleSelects'])

export function isSelectFieldType(type: string): boolean {
  return SELECT_FIELD_TYPES.has(type)
}

export function parseSelectChoices(field: MetaFieldSchema): SelectChoice[] {
  if (!isSelectFieldType(field.type)) return []
  const raw = field.options?.choices
  if (!Array.isArray(raw)) return []

  const choices: SelectChoice[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const row = item as { id?: unknown; name?: unknown; color?: unknown }
    const name = typeof row.name === 'string' ? row.name.trim() : ''
    const id = typeof row.id === 'string' ? row.id : name
    if (!name) continue
    const choice: SelectChoice = { id, name }
    if (typeof row.color === 'string' && row.color.trim()) {
      choice.color = row.color.trim()
    }
    choices.push(choice)
  }
  return choices
}

export function selectChoiceByName(
  choices: readonly SelectChoice[],
  value: string,
): SelectChoice | undefined {
  const normalized = value.trim().toLowerCase()
  return choices.find((c) => c.name.trim().toLowerCase() === normalized)
}

/** Human-readable summary including choice colors when present. */
export function formatSelectChoicesSummary(field: MetaFieldSchema): string {
  const choices = parseSelectChoices(field)
  if (choices.length === 0) return '—'

  const parts = choices.map((c) =>
    c.color ? `${c.name} (${c.color})` : c.name,
  )
  if (parts.length <= 4) return parts.join(', ')
  return `${parts.slice(0, 4).join(', ')} (+${parts.length - 4} more)`
}
