import type { MetaTableSchema } from './metaTypes.ts'

/** Choice names for a single-select field from Meta API `options.choices`. */
export function getSingleSelectChoiceNames(
  table: MetaTableSchema,
  airtableFieldName: string,
): string[] {
  const field = table.fields.find((f) => f.name === airtableFieldName)
  if (!field || field.type !== 'singleSelect') return []
  const choices = field.options?.choices as { name?: string }[] | undefined
  return (choices ?? [])
    .map((c) => c.name)
    .filter((n): n is string => Boolean(n?.trim()))
}
