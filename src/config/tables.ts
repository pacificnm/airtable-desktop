import type { AppView } from '../components/main/appView.ts'
import type { RecordViewMode } from '../components/ui/record/recordTypes.ts'
import { getModuleTableContributions } from '../lib/modules/registry.ts'
import type {
  AirtableTableConfig,
  AirtableTableEntry,
  TableKey,
  TableViewMap,
} from './tableTypes.ts'

export type {
  AirtableTableConfig,
  AirtableTableEntry,
  FieldValidationOverride,
  TableColumnConfig,
  TableFieldMap,
  TableKey,
  TableListConfig,
  TableViewMap,
} from './tableTypes.ts'

/**
 * App-owned table entries (paste from Developer → Tables).
 * Enabled modules append tables via `src/lib/modules/registry.ts`.
 */
export const coreAirtableTables = [] as const satisfies readonly AirtableTableConfig[]

export const airtableTables = [
  ...coreAirtableTables,
  ...getModuleTableContributions(),
] as const satisfies readonly AirtableTableConfig[]

export function getConfiguredTables(): readonly AirtableTableEntry[] {
  return airtableTables as readonly AirtableTableEntry[]
}

export const tableConfigByKey: Record<string, AirtableTableEntry> =
  Object.fromEntries(getConfiguredTables().map((t) => [t.key, t]))

export function getTableConfig(key: TableKey): AirtableTableEntry | undefined {
  return tableConfigByKey[key]
}

export function tableScreens(
  table: AirtableTableEntry,
): readonly AppView[] | undefined {
  return table.screens
}

export function getTableForView(view: AppView): AirtableTableEntry | undefined {
  return getConfiguredTables().find((t) => tableScreens(t)?.includes(view))
}

/** Named view slot on a table config (not necessarily an `AppView` route). */
export type TableViewScreen = keyof TableViewMap

export function getViewForScreen(
  table: AirtableTableEntry,
  screen: TableViewScreen,
): string | undefined {
  const views = table.views
  if (!views) return undefined
  if (screen === 'grid') {
    return views.grid ?? views.table ?? views.default
  }
  if (screen === 'card') {
    return views.card ?? views.grid ?? views.table ?? views.default
  }
  return views[screen] ?? views.default
}

/** Airtable `view` query param for the active grid or card UI mode. */
export function getAirtableViewForRecordMode(
  table: AirtableTableEntry,
  mode: RecordViewMode,
): string | undefined {
  return mode === 'card'
    ? getViewForScreen(table, 'card')
    : getViewForScreen(table, 'grid')
}

export function resolveFieldName(
  table: AirtableTableEntry,
  configKey: string,
): string | undefined {
  return table.fields[configKey]
}
