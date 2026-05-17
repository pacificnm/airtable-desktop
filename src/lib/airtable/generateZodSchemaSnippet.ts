import type { MetaTableSchema } from './metaTypes.ts'
import {
  inferAllFieldsZod,
  type FieldZodInference,
  type TableZodMode,
} from './inferZodFromField.ts'
import {
  configKeyFromTableName,
  pascalFromConfigKey,
} from './tableCodegen.ts'

function formatFieldLine(
  inference: FieldZodInference,
  mode: TableZodMode,
): string | null {
  if (mode === 'create' && inference.readOnly) return null

  let expr = inference.zodExpr
  if (mode === 'create' && inference.requiredHint === 'primary') {
    if (expr === 'z.string()') expr = 'z.string().min(1)'
  } else if (mode !== 'create' || inference.requiredHint !== 'primary') {
    expr = `${expr}.optional()`
  }

  const noteParts: string[] = [
    inference.airtableType,
    inference.airtableName,
  ]
  if (inference.requiredHint === 'primary') noteParts.push('primary')
  if (inference.requiredHint === 'unknown' && !inference.readOnly) {
    noteParts.push('required? unknown in API')
  }

  return `  ${inference.configKey}: ${expr}, // ${noteParts.join(' · ')}`
}

function formatSchemaBlock(
  table: MetaTableSchema,
  mode: TableZodMode,
  exportName: string,
): string {
  const inferences = inferAllFieldsZod(table)
  const lines = inferences
    .map((i) => formatFieldLine(i, mode))
    .filter((line): line is string => line != null)

  const modeComment =
    mode === 'create'
      ? 'Fields you can send when creating a record (read-only columns omitted).'
      : mode === 'patch'
        ? 'Partial update — all keys optional; tighten per field in app config.'
        : 'Full record shape as returned by the API (computed fields included).'

  return `export const ${exportName} = z.object({
${lines.join('\n')}
})

export type ${pascalFromConfigKey(exportName.replace(/Schema$/, ''))} = z.infer<typeof ${exportName}>
// ${modeComment}`
}

/**
 * Pasteable Zod module for a table. Uses config keys (camelCase) matching `fields` in tables.ts.
 */
export function generateZodSchemaSnippet(
  table: MetaTableSchema,
  options?: { key?: string },
): string {
  const base = configKeyFromTableName(table.name, options?.key)
  const pascal = pascalFromConfigKey(base)

  const createName = `${base}CreateSchema`
  const patchName = `${base}PatchSchema`
  const recordName = `${base}RecordSchema`

  return `import { z } from 'zod'

/**
 * Generated from Airtable Meta API for table "${table.name}" (${table.id}).
 * Airtable does not expose form "required" flags — only primary field + type/options are inferred.
 * Add app overrides in tables config or edit schemas after paste.
 */

${formatSchemaBlock(table, 'create', createName)}

${formatSchemaBlock(table, 'patch', patchName)}

${formatSchemaBlock(table, 'record', recordName)}

// Example: validate before createRecords
// const parsed = ${createName}.safeParse(formValues)
// Types: ${pascal}Create, ${pascal}Patch, ${pascal}Record
`
}
