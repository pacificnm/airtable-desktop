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

/**
 * Snapshot taken at module-evaluation time, before App Config hydration or provisioning has run —
 * only safe for shape checks (e.g. "are any module tables contributed at all"). Table `tableId`s
 * here may still be placeholders; use `getConfiguredTables()`/`getTableConfig()` for live ids.
 */
export const airtableTables = [
  ...coreAirtableTables,
  ...getModuleTableContributions(),
] as const satisfies readonly AirtableTableConfig[]

/**
 * Re-resolves module table ids on every call (App Config cache, then localStorage provisioning),
 * so ids that hydrate after this module first loads — e.g. on a new device with no localStorage
 * data — take effect once available, instead of being frozen at the first, pre-hydration read.
 */
export function getConfiguredTables(): readonly AirtableTableEntry[] {
  return [
    ...coreAirtableTables,
    ...getModuleTableContributions(),
  ] as readonly AirtableTableEntry[]
}

export function getTableConfig(key: TableKey): AirtableTableEntry | undefined {
  return getConfiguredTables().find((t) => t.key === key)
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
