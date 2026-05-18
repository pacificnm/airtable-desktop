import type { AirtableTableConfig, MetaFieldSnapshot } from '../../config/tableTypes.ts'
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

export function moduleFieldsMetaExportName(moduleId: string): string {
  return `${moduleId}ModuleFieldsMeta`
}

function formatOptionsLiteral(options: Record<string, unknown> | undefined): string {
  if (!options || Object.keys(options).length === 0) return 'undefined'
  const json = JSON.stringify(options, null, 2)
  return json
    .split('\n')
    .map((line, index) => (index === 0 ? line : `        ${line}`))
    .join('\n')
}

function buildFieldSnapshots(meta: MetaTableSchema): MetaFieldSnapshot[] {
  const fields = buildCompleteFieldMap(meta.fields)
  const configKeyByAirtableName = new Map(
    Object.entries(fields).map(([configKey, airtableName]) => [airtableName, configKey]),
  )

  return [...meta.fields]
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'accent' }))
    .map((field) => {
      const snapshot: MetaFieldSnapshot = {
        id: field.id,
        configKey:
          configKeyByAirtableName.get(field.name) ?? fieldNameToConfigKey(field.name),
        name: field.name,
        type: field.type,
      }
      if (field.description?.trim()) snapshot.description = field.description.trim()
      if (field.options && Object.keys(field.options).length > 0) {
        snapshot.options = field.options
      }
      return snapshot
    })
}

function formatFieldSnapshotBlock(snapshot: MetaFieldSnapshot): string {
  const lines = [
    `    {`,
    `      id: ${quote(snapshot.id)},`,
    `      configKey: ${quote(snapshot.configKey)},`,
    `      name: ${quote(snapshot.name)},`,
    `      type: ${quote(snapshot.type)},`,
  ]
  if (snapshot.description) {
    lines.push(`      description: ${quote(snapshot.description)},`)
  }
  lines.push(`      options: ${formatOptionsLiteral(snapshot.options)},`)
  lines.push(`    },`)
  return lines.join('\n')
}

/** Full `tables.meta.ts` — field types and options (select colors, links, etc.) from Meta API. */
export function generateModuleFieldsMetaFileContent(
  moduleId: string,
  tableConfigs: readonly AirtableTableConfig[],
  schemaTables: readonly MetaTableSchema[],
): string {
  const tableBlocks: string[] = []

  for (const tableConfig of tableConfigs) {
    const meta = resolveMetaTableForConfig(tableConfig, schemaTables)
    if (!meta) continue
    const snapshots = buildFieldSnapshots(meta)
    const fieldBlocks = snapshots.map(formatFieldSnapshotBlock).join('\n')
    tableBlocks.push(`  ${quote(tableConfig.key)}: [\n${fieldBlocks}\n  ],`)
  }

  const exportName = moduleFieldsMetaExportName(moduleId)
  return `import type { MetaFieldSnapshot } from '@/config/tableTypes.ts'

/**
 * Full field metadata from Airtable Meta API (types, select colors, link targets, etc.).
 * Regenerate via Developer → Modules → Sync schema from Airtable.
 * @see https://airtable.com/developers/web/api/field-model
 */
export const ${exportName}: Record<string, readonly MetaFieldSnapshot[]> = {
${tableBlocks.join('\n')}
}
`
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
 * For select colors and full field options, see \`tables.meta.ts\` in this folder.
 */
export const ${exportName} = [
${blocks.join(',\n')},
] as const satisfies readonly AirtableTableConfig[]
`
}
