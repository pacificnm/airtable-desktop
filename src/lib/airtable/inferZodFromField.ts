import { z } from 'zod'
import type { MetaFieldSchema, MetaTableSchema } from './metaTypes.ts'
import { fieldNameToConfigKey } from './mapTableFields.ts'

/** What Airtable (or our rules) imply about required-on-create. */
export type AirtableRequiredHint =
  | 'primary'
  | 'never'
  | 'unknown'

export interface FieldZodInference {
  configKey: string
  airtableName: string
  airtableType: string
  /** Pasteable Zod expression (without trailing .optional()). */
  zodExpr: string
  requiredHint: AirtableRequiredHint
  readOnly: boolean
  notes: string[]
}

const READ_ONLY_TYPES = new Set([
  'autoNumber',
  'formula',
  'rollup',
  'count',
  'lookup',
  'multipleLookupValues',
  'createdTime',
  'createdBy',
  'lastModifiedTime',
  'lastModifiedBy',
  'button',
  'externalSyncSource',
  'aiText',
])

export function isReadOnlyAirtableField(field: MetaFieldSchema): boolean {
  return READ_ONLY_TYPES.has(field.type)
}

function selectChoiceNames(field: MetaFieldSchema): string[] {
  const choices = field.options?.choices as { name?: string }[] | undefined
  if (!choices?.length) return []
  return choices.map((c) => c.name).filter((n): n is string => Boolean(n))
}

function quoteEnumValue(value: string): string {
  return JSON.stringify(value)
}

/** Core Zod type from Airtable field type + options (not optional/required wrapper). */
export function inferZodExpr(field: MetaFieldSchema): {
  expr: string
  schema: z.ZodType
  notes: string[]
} {
  const notes: string[] = []
  const o = field.options ?? {}

  switch (field.type) {
    case 'singleLineText':
    case 'multilineText':
    case 'richText':
    case 'phoneNumber':
    case 'barcode':
      return { expr: 'z.string()', schema: z.string(), notes }
    case 'email':
      return { expr: 'z.email()', schema: z.email(), notes }
    case 'url':
      return { expr: 'z.url()', schema: z.url(), notes }
    case 'number':
    case 'percent':
    case 'currency':
      return { expr: 'z.number()', schema: z.number(), notes }
    case 'rating': {
      const max = typeof o.max === 'number' ? o.max : 5
      notes.push(`rating 1–${max}`)
      return {
        expr: `z.number().min(1).max(${max})`,
        schema: z.number().min(1).max(max),
        notes,
      }
    }
    case 'checkbox':
      return { expr: 'z.boolean()', schema: z.boolean(), notes }
    case 'date':
      notes.push('Airtable date cells are ISO date strings (YYYY-MM-DD)')
      return {
        expr: 'z.iso.date()',
        schema: z.iso.date(),
        notes,
      }
    case 'dateTime':
      notes.push('Airtable datetime cells are ISO 8601 strings')
      return {
        expr: 'z.iso.datetime()',
        schema: z.iso.datetime(),
        notes,
      }
    case 'duration':
      return { expr: 'z.number()', schema: z.number(), notes }
    case 'singleSelect': {
      const names = selectChoiceNames(field)
      if (names.length === 0) {
        notes.push('no choices in schema — using z.string()')
        return { expr: 'z.string()', schema: z.string(), notes }
      }
      const literals = names.map(quoteEnumValue).join(', ')
      return {
        expr: `z.enum([${literals}])`,
        schema: z.enum(names as [string, ...string[]]),
        notes,
      }
    }
    case 'multipleSelects': {
      const names = selectChoiceNames(field)
      if (names.length === 0) {
        return {
          expr: 'z.array(z.string())',
          schema: z.array(z.string()),
          notes: ['no choices in schema'],
        }
      }
      const literals = names.map(quoteEnumValue).join(', ')
      return {
        expr: `z.array(z.enum([${literals}]))`,
        schema: z.array(z.enum(names as [string, ...string[]])),
        notes,
      }
    }
    case 'multipleRecordLinks': {
      const single = o.prefersSingleRecordLink === true
      if (single) {
        notes.push('linked record id')
        return { expr: 'z.string()', schema: z.string(), notes }
      }
      return {
        expr: 'z.array(z.string())',
        schema: z.array(z.string()),
        notes: ['linked record ids'],
      }
    }
    case 'multipleAttachments':
      return {
        expr:
          'z.array(z.object({ id: z.string(), url: z.string().optional(), filename: z.string().optional() }).passthrough())',
        schema: z.array(
          z
            .object({
              id: z.string(),
              url: z.string().optional(),
              filename: z.string().optional(),
            })
            .passthrough(),
        ),
        notes: ['attachment objects from Airtable API'],
      }
    case 'singleCollaborator':
      return {
        expr:
          'z.object({ id: z.string(), email: z.string().optional(), name: z.string().optional() }).passthrough()',
        schema: z
          .object({
            id: z.string(),
            email: z.string().optional(),
            name: z.string().optional(),
          })
          .passthrough(),
        notes,
      }
    case 'multipleCollaborators':
      return {
        expr:
          'z.array(z.object({ id: z.string(), email: z.string().optional() }).passthrough())',
        schema: z.array(
          z.object({ id: z.string(), email: z.string().optional() }).passthrough(),
        ),
        notes,
      }
    default:
      if (isReadOnlyAirtableField(field)) {
        notes.push('read-only in Airtable — omit from create payloads')
        return { expr: 'z.unknown()', schema: z.unknown(), notes }
      }
      notes.push(`unmapped type "${field.type}" — refine manually`)
      return { expr: 'z.unknown()', schema: z.unknown(), notes }
  }
}

export function inferFieldZod(
  field: MetaFieldSchema,
  ctx: { primaryFieldId: string },
): FieldZodInference {
  const configKey = fieldNameToConfigKey(field.name)
  const readOnly = isReadOnlyAirtableField(field)
  const isPrimary = field.id === ctx.primaryFieldId
  const { expr, notes: typeNotes } = inferZodExpr(field)
  const notes = [...typeNotes]

  let requiredHint: AirtableRequiredHint = 'unknown'
  if (isPrimary) {
    requiredHint = 'primary'
    notes.push('primary field — required when creating a record')
  } else if (readOnly) {
    requiredHint = 'never'
  } else {
    notes.push(
      'required flag not exposed by Airtable API — default optional; set required in app config if needed',
    )
  }

  return {
    configKey,
    airtableName: field.name,
    airtableType: field.type,
    zodExpr: expr,
    requiredHint,
    readOnly,
    notes,
  }
}

export type TableZodMode = 'create' | 'patch' | 'record'

function wrapForMode(
  inference: FieldZodInference,
  field: MetaFieldSchema,
  schema: z.ZodType,
  mode: TableZodMode,
  requiredOverride?: boolean,
): z.ZodType {
  if (mode === 'create' && inference.readOnly) return schema

  const mustRequire =
    mode === 'create' &&
    (requiredOverride === true ||
      (requiredOverride !== false && inference.requiredHint === 'primary'))

  if (mustRequire) {
    const { expr } = inferZodExpr(field)
    if (expr === 'z.string()') return z.string().min(1)
    return schema
  }

  if (requiredOverride === true && mode !== 'create') {
    return schema
  }

  return schema.optional()
}

/** Per config-key overrides (app-level required — not from Airtable API). */
export type FieldValidationOverrides = Record<
  string,
  { required?: boolean } | undefined
>

/** Runtime Zod object keyed by config keys (camelCase). */
export function buildTableZodObject(
  table: MetaTableSchema,
  mode: TableZodMode,
  overrides?: FieldValidationOverrides,
): z.ZodObject<Record<string, z.ZodType>> {
  const shape: Record<string, z.ZodType> = {}

  for (const field of table.fields) {
    const inference = inferFieldZod(field, {
      primaryFieldId: table.primaryFieldId,
    })
    if (mode === 'create' && inference.readOnly) continue

    const { schema } = inferZodExpr(field)
    const override = overrides?.[inference.configKey]?.required
    shape[inference.configKey] = wrapForMode(
      inference,
      field,
      schema,
      mode,
      override,
    )
  }

  return z.object(shape)
}

export function inferAllFieldsZod(
  table: MetaTableSchema,
): FieldZodInference[] {
  return table.fields.map((f) =>
    inferFieldZod(f, { primaryFieldId: table.primaryFieldId }),
  )
}
