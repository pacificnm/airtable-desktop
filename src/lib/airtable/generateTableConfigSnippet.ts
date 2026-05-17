import type { AppView } from '../../components/main/appView.ts'
import type { MetaTableSchema } from './metaTypes.ts'
import {
  buildCompleteFieldMap,
  orderedFieldKeys,
} from './mapTableFields.ts'

const KNOWN_APP_VIEWS: readonly AppView[] = [
  'kanban',
  'table',
  'groups',
  'documents',
  'technicians',
  'categories',
  'servicelevels',
  'devTables',
  'devTokens',
  'devTheme',
]

function toConfigKey(name: string): string {
  const base = name
    .trim()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
  const first = base.charAt(0).toLowerCase()
  return first + base.slice(1)
}

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function primaryFieldName(table: MetaTableSchema): string {
  return (
    table.fields.find((f) => f.id === table.primaryFieldId)?.name ??
    table.fields[0]?.name ??
    'Name'
  )
}

function resolveTableView(table: MetaTableSchema): string {
  const grid = table.views.find((v) => v.type === 'grid')
  if (grid) return grid.name
  return table.views[0]?.name ?? 'Grid view'
}

function resolveKanbanView(table: MetaTableSchema, tableView: string): string {
  return table.views.find((v) => v.type === 'kanban')?.name ?? tableView
}

function resolveCardView(table: MetaTableSchema, tableView: string): string {
  return (
    table.views.find((v) => v.type === 'gallery')?.name ??
    table.views.find((v) => v.type === 'grid')?.name ??
    tableView
  )
}

/** Only set screens when the table key matches an existing {@link AppView}. */
function inferScreens(configKey: string): readonly AppView[] | null {
  const lower = configKey.toLowerCase()
  const byKey = KNOWN_APP_VIEWS.find((v) => v === lower)
  return byKey ? [byKey] : null
}

function formatScreens(screens: readonly AppView[]): string {
  return `[${screens.map((s) => quote(s)).join(', ')}]`
}

function formatFieldsBlock(fields: Record<string, string>): string {
  return orderedFieldKeys(fields)
    .map((key) => `    ${key}: ${quote(fields[key]!)},`)
    .join('\n')
}

function formatColumnsBlock(table: MetaTableSchema): string {
  return table.fields
    .map((f) => `      { field: ${quote(f.name)} },`)
    .join('\n')
}

function formatListBlock(): string {
  return `  list: {
    pageSize: 100,
  },`
}

/**
 * Full `airtableTables` entry for pasting into `src/config/tables.ts`.
 * Every Airtable column is included in `fields` and `columns`.
 */
export function generateTableConfigSnippet(
  table: MetaTableSchema,
  options?: { key?: string },
): string {
  const key = options?.key ?? toConfigKey(table.name)
  const primary = primaryFieldName(table)
  const tableView = resolveTableView(table)
  const kanbanView = resolveKanbanView(table, tableView)
  const cardView = resolveCardView(table, tableView)
  const screens = inferScreens(key)
  const fields = buildCompleteFieldMap(table.fields)
  const screensLine = screens
    ? `  screens: ${formatScreens(screens)},\n`
    : `  // screens: ['yourAppView'],\n`

  return `{
  key: ${quote(key)},
  label: ${quote(table.name)},
  tableId: ${quote(table.id)},
  tableName: ${quote(table.name)},
  primaryField: ${quote(primary)},
  // validation: { myField: { required: true } }, // app-level; not from Airtable API
${screensLine}  views: {
    default: ${quote(tableView)},
    grid: ${quote(tableView)},
    card: ${quote(cardView)},
    kanban: ${quote(kanbanView)},
  },
  fields: {
${formatFieldsBlock(fields)}
  },
${formatListBlock()}
  columns: [
${formatColumnsBlock(table)}
  ],
},`
}
