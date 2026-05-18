import type { MetaTableSchema } from './metaTypes.ts'
import { parseSelectChoices } from './fieldOptions.ts'

/** Choice names for a single-select field from Meta API `options.choices`. */
export function getSingleSelectChoiceNames(
  table: MetaTableSchema,
  airtableFieldName: string,
): string[] {
  const field = table.fields.find((f) => f.name === airtableFieldName)
  if (!field || field.type !== 'singleSelect') return []
  return parseSelectChoices(field).map((c) => c.name)
}
