/**
 * Field shape from Get base schema.
 * @see https://airtable.com/developers/web/api/get-base-schema
 * @see https://airtable.com/developers/web/api/field-model — per-type `options`
 *
 * Not provided by this API: required flags, form validation, min/max length on text, etc.
 */
export interface MetaFieldSchema {
  id: string
  name: string
  type: string
  description?: string
  /** Type-specific config (select choices, link target, precision, formula, …). */
  options?: Record<string, unknown>
}

export interface MetaViewSchema {
  id: string
  name: string
  type: string
}

export interface MetaTableSchema {
  id: string
  name: string
  description?: string
  primaryFieldId: string
  fields: MetaFieldSchema[]
  views: MetaViewSchema[]
}

export interface BaseSchemaResponse {
  tables: MetaTableSchema[]
}
