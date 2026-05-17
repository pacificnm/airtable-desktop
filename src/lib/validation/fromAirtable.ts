import type { AirtableTableConfig } from '../../config/tables.ts'
import type { MetaTableSchema } from '../airtable/metaTypes.ts'
import {
  buildTableZodObject,
  type FieldValidationOverrides,
  type TableZodMode,
} from '../airtable/inferZodFromField.ts'

function overridesFromConfig(
  table: AirtableTableConfig,
): FieldValidationOverrides | undefined {
  if (!table.validation) return undefined
  const out: FieldValidationOverrides = {}
  for (const [key, rule] of Object.entries(table.validation)) {
    if (rule?.required != null) out[key] = { required: rule.required }
  }
  return Object.keys(out).length > 0 ? out : undefined
}

/** Build a Zod schema for a table using live Meta API schema + optional `tables.ts` overrides. */
export function zodSchemaForTable(
  meta: MetaTableSchema,
  config: AirtableTableConfig,
  mode: TableZodMode,
) {
  return buildTableZodObject(meta, mode, overridesFromConfig(config))
}
