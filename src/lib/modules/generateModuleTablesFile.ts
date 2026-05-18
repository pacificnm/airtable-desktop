import type { AirtableTableConfig } from '../../config/tableTypes.ts'
import type { MetaTableSchema } from '../airtable/metaTypes.ts'
import {
  buildCompleteFieldMap,
  fieldNameToConfigKey,
  orderedFieldKeys,
} from '../airtable/mapTableFields.ts'
import { isPlaceholderTableId } from './tableBlueprints.ts'

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function primaryFieldConfigKey(table: MetaTableSchema, fields: Record<string, string>): string {
  const primaryName =
    table.fields.find((f) => f.id === table.primaryFieldId)?.name ??
    table.fields[0]?.name ??
    'Name'
  const entry = Object.entries(fields).find(([, airtableName]) => airtableName === primaryName)
  return entry?.[0] ?? fieldNameToConfigKey(primaryName)
}

function formatFieldsBlock(fields: Record<string, string>): string {
  return orderedFieldKeys(fields)
    .map((key) => `      ${key}: ${quote(fields[key]!)},`)
    .join('\n')
}

function formatColumnsBlock(fields: Record<string, string>): string {
  return orderedFieldKeys(fields)
    .map((key) => {
      const label = fields[key]!
      return `      { field: ${quote(key)}, label: ${quote(label)} },`
    })
    .join('\n')
}

function formatValidationBlock(
  validation: AirtableTableConfig['validation'],
): string {
  if (!validation || Object.keys(validation).length === 0) return ''
  const lines = Object.entries(validation).map(([key, rule]) => {
    const parts: string[] = []
    if (rule?.required) parts.push('required: true')
    return `      ${key}: { ${parts.join(', ')} },`
  })
  return `    validation: {\n${lines.join('\n')}\n    },\n`
}

function formatListBlock(
  existing: AirtableTableConfig['list'],
  sortFieldAirtableName: string,
): string {
  const pageSize = existing?.pageSize ?? 50
  const lines = [`    list: { pageSize: ${pageSize}`]
  if (sortFieldAirtableName) {
    lines.push(
      `, sort: [{ field: ${quote(sortFieldAirtableName)}, direction: 'asc' }]`,
    )
  }
  lines.push(' },\n')
  return lines.join('')
}

function formatScreensBlock(screens: readonly string[] | undefined): string {
  if (!screens?.length) return ''
  return `    screens: [${screens.map((s) => quote(s)).join(', ')}],\n`
}

export function resolveMetaTableForConfig(
  tableConfig: AirtableTableConfig,
  schemaTables: readonly MetaTableSchema[],
): MetaTableSchema | undefined {
  if (tableConfig.tableId && !isPlaceholderTableId(tableConfig.tableId)) {
    const byId = schemaTables.find((t) => t.id === tableConfig.tableId)
    if (byId) return byId
  }
  const name = tableConfig.tableName ?? tableConfig.label
  return schemaTables.find(
    (t) => t.name.localeCompare(name, undefined, { sensitivity: 'accent' }) === 0,
  )
}

export function generateModuleTableEntrySnippet(
  tableConfig: AirtableTableConfig,
  meta: MetaTableSchema,
): string {
  const fields = buildCompleteFieldMap(meta.fields)
  const primaryKey = primaryFieldConfigKey(meta, fields)
  const primaryAirtableName = fields[primaryKey] ?? meta.fields[0]?.name ?? 'Name'
  const validation = { ...(tableConfig.validation ?? {}) }
  if (validation[primaryKey]?.required !== false) {
    validation[primaryKey] = { ...validation[primaryKey], required: true }
  }

  return `  {
    key: ${quote(tableConfig.key)},
    label: ${quote(tableConfig.label)},
    tableId: ${quote(meta.id)},
    tableName: ${quote(meta.name)},
    primaryField: ${quote(primaryKey)},
    fields: {
${formatFieldsBlock(fields)}
    },
    columns: [
${formatColumnsBlock(fields)}
    ],
${formatListBlock(tableConfig.list, primaryAirtableName)}${formatScreensBlock(tableConfig.screens)}${formatValidationBlock(validation)}  }`
}

export function moduleTablesExportName(moduleId: string): string {
  return `${moduleId}ModuleTables`
}

/** Full `tables.ts` source for a module (safe import from Airtable meta API). */
export function generateModuleTablesFileContent(
  moduleId: string,
  tableConfigs: readonly AirtableTableConfig[],
  schemaTables: readonly MetaTableSchema[],
): string {
  const blocks: string[] = []
  for (const tableConfig of tableConfigs) {
    const meta = resolveMetaTableForConfig(tableConfig, schemaTables)
    if (!meta) {
      const hint = tableConfig.tableName ?? tableConfig.label
      throw new Error(
        `Could not find Airtable table "${hint}" (key "${tableConfig.key}") in the connected base.`,
      )
    }
    blocks.push(generateModuleTableEntrySnippet(tableConfig, meta))
  }

  const exportName = moduleTablesExportName(moduleId)
  return `import type { AirtableTableConfig } from '@/config/tableTypes.ts'

/**
 * Field map synced from Airtable (read-only meta API). Does not create or modify base schema.
 * Regenerate via Developer → Modules → Sync schema from Airtable.
 */
export const ${exportName} = [
${blocks.join(',\n')},
] as const satisfies readonly AirtableTableConfig[]
`
}
