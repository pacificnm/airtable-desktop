import { fieldNameToConfigKey } from './mapTableFields.ts'
import type { MetaFieldSchema, MetaTableSchema } from './metaTypes.ts'

const LINK_FIELD_TYPES = new Set([
  'multipleRecordLinks',
  'singleRecordLink',
])

const LOOKUP_FIELD_TYPES = new Set(['lookup', 'multipleLookupValues'])

export function isLinkFieldType(type: string): boolean {
  return LINK_FIELD_TYPES.has(type)
}

export function isLookupFieldType(type: string): boolean {
  return LOOKUP_FIELD_TYPES.has(type)
}

export function isRecordId(value: unknown): boolean {
  return typeof value === 'string' && /^rec[a-zA-Z0-9]+$/.test(value)
}

export function collectRecordIds(value: unknown): string[] {
  if (typeof value === 'string' && isRecordId(value)) return [value]
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectRecordIds(item))
  }
  return []
}

function linkFieldById(
  table: MetaTableSchema,
  fieldId: string | undefined,
): MetaFieldSchema | undefined {
  if (!fieldId) return undefined
  const field = table.fields.find((f) => f.id === fieldId)
  return field && isLinkFieldType(field.type) ? field : undefined
}

export function lookupFieldsForLink(
  table: MetaTableSchema,
  linkField: MetaFieldSchema,
): MetaFieldSchema[] {
  return table.fields.filter((candidate) => {
    if (!LOOKUP_FIELD_TYPES.has(candidate.type)) return false
    const options = candidate.options as { recordLinkFieldId?: string } | undefined
    return options?.recordLinkFieldId === linkField.id
  })
}

function lookupFieldForLink(
  table: MetaTableSchema,
  linkField: MetaFieldSchema,
): MetaFieldSchema | undefined {
  return lookupFieldsForLink(table, linkField)[0]
}

export interface DisplayFieldMeta {
  linkField: MetaFieldSchema
  linkedTableId: string
  lookupFields: MetaFieldSchema[]
}

/**
 * Resolve link + lookup columns for a config key (e.g. region may be a lookup while the link is named differently).
 */
export function displayFieldMetaForConfigKey(
  table: MetaTableSchema,
  configKey: string,
  configuredAirtableName?: string,
): DisplayFieldMeta | undefined {
  let linkField = table.fields.find(
    (f) => fieldNameToConfigKey(f.name) === configKey && isLinkFieldType(f.type),
  )

  if (!linkField && configuredAirtableName) {
    const byName = table.fields.find((f) => f.name === configuredAirtableName)
    if (byName && isLinkFieldType(byName.type)) {
      linkField = byName
    } else if (byName && isLookupFieldType(byName.type)) {
      linkField = linkFieldById(
        table,
        (byName.options as { recordLinkFieldId?: string } | undefined)?.recordLinkFieldId,
      )
    }
  }

  if (!linkField) {
    const lookup = table.fields.find(
      (f) => fieldNameToConfigKey(f.name) === configKey && isLookupFieldType(f.type),
    )
    if (lookup) {
      linkField = linkFieldById(
        table,
        (lookup.options as { recordLinkFieldId?: string } | undefined)?.recordLinkFieldId,
      )
    }
  }

  if (!linkField) return undefined

  const options = linkField.options as { linkedTableId?: string } | undefined
  const linkedTableId = options?.linkedTableId
  if (!linkedTableId) return undefined

  return {
    linkField,
    linkedTableId,
    lookupFields: lookupFieldsForLink(table, linkField),
  }
}

/** @deprecated Use {@link displayFieldMetaForConfigKey} */
export function linkFieldMetaForConfigKey(
  table: MetaTableSchema,
  configKey: string,
): { linkField: MetaFieldSchema; linkedTableId: string } | undefined {
  const meta = displayFieldMetaForConfigKey(table, configKey)
  if (!meta) return undefined
  return { linkField: meta.linkField, linkedTableId: meta.linkedTableId }
}

/** Raw Airtable cell values that may hold labels or linked record ids. */
export function rawDisplayValuesForMeta(
  rawFields: Record<string, unknown>,
  meta: DisplayFieldMeta,
  configuredAirtableName?: string,
): unknown[] {
  const values: unknown[] = [rawFields[meta.linkField.name]]
  if (configuredAirtableName) {
    values.push(rawFields[configuredAirtableName])
  }
  for (const lookup of meta.lookupFields) {
    if (lookup.name !== configuredAirtableName) {
      values.push(rawFields[lookup.name])
    }
  }
  return values
}

export function collectRecordIdsForDisplayMeta(
  rawFields: Record<string, unknown>,
  meta: DisplayFieldMeta,
  configuredAirtableName?: string,
): string[] {
  const ids = new Set<string>()
  for (const value of rawDisplayValuesForMeta(rawFields, meta, configuredAirtableName)) {
    for (const id of collectRecordIds(value)) ids.add(id)
  }
  return [...ids]
}

/**
 * Airtable field names on the linked table to read when resolving record labels.
 */
export function labelFieldNamesForLinkedTable(
  linkedTable: MetaTableSchema,
  lookupFields: readonly MetaFieldSchema[],
): string[] {
  const names = new Set<string>()

  for (const lookup of lookupFields) {
    const options = lookup.options as { fieldIdInLinkedTable?: string } | undefined
    const targetId = options?.fieldIdInLinkedTable
    if (targetId) {
      const target = linkedTable.fields.find((f) => f.id === targetId)
      if (target) names.add(target.name)
    }
  }

  names.add(primaryFieldName(linkedTable))
  return [...names]
}

/**
 * For link fields like City → prefer a lookup column that already exposes labels.
 * Returns config key → Airtable field name to use in tables.ts / list queries.
 */
export function displayFieldOverridesForTable(
  table: MetaTableSchema,
  configKeys: readonly string[],
): Partial<Record<string, string>> {
  const overrides: Partial<Record<string, string>> = {}

  for (const configKey of configKeys) {
    const meta = displayFieldMetaForConfigKey(table, configKey)
    if (!meta) continue

    const lookup = lookupFieldForLink(table, meta.linkField)
    if (lookup) {
      overrides[configKey] = lookup.name
    }
  }

  return overrides
}

export function primaryFieldName(table: MetaTableSchema): string {
  return (
    table.fields.find((f) => f.id === table.primaryFieldId)?.name ??
    table.fields[0]?.name ??
    'Name'
  )
}
