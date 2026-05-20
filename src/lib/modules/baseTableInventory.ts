import { configKeyFromTableName } from '../airtable/tableCodegen.ts'
import { fieldNameToConfigKey } from '../airtable/mapTableFields.ts'
import type { MetaTableSchema } from '../airtable/metaTypes.ts'
import { isPlaceholderTableId } from './tableBlueprints.ts'
import { getDiscoveredModules } from './registry.ts'

export interface ModuleTableRef {
  moduleId: string
  tableKey: string
  tableId: string
}

export interface BaseTableInventoryRow {
  tableId: string
  tableName: string
  fieldCount: number
  primaryFieldName: string
  primaryFieldKey: string
  suggestedModuleId: string
  suggestedTableKey: string
  suggestedScreenId: string
  coveredBy?: ModuleTableRef
}

/** Map Airtable table id → module that already declares it in tables.ts. */
export function indexModuleTablesByAirtableId(): Map<string, ModuleTableRef> {
  const index = new Map<string, ModuleTableRef>()
  for (const { definition } of getDiscoveredModules()) {
    for (const table of definition.tables ?? []) {
      if (!table.tableId || isPlaceholderTableId(table.tableId)) continue
      index.set(table.tableId, {
        moduleId: definition.id,
        tableKey: table.key,
        tableId: table.tableId,
      })
    }
  }
  return index
}

export function buildBaseTableInventory(
  schemaTables: readonly MetaTableSchema[],
): BaseTableInventoryRow[] {
  const byTableId = indexModuleTablesByAirtableId()

  return [...schemaTables]
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    .map((table) => {
      const primaryFieldName =
        table.fields.find((f) => f.id === table.primaryFieldId)?.name ??
        table.fields[0]?.name ??
        'Name'
      const primaryFieldKey = fieldNameToConfigKey(primaryFieldName)
      const suggestedTableKey = configKeyFromTableName(table.name)
      const suggestedModuleId = suggestedTableKey
      const suggestedScreenId = `${suggestedTableKey}List`

      return {
        tableId: table.id,
        tableName: table.name,
        fieldCount: table.fields.length,
        primaryFieldName,
        primaryFieldKey,
        suggestedModuleId,
        suggestedTableKey,
        suggestedScreenId,
        coveredBy: byTableId.get(table.id),
      }
    })
}

export function inventorySummary(rows: readonly BaseTableInventoryRow[]) {
  const covered = rows.filter((row) => row.coveredBy).length
  return {
    total: rows.length,
    covered,
    uncovered: rows.length - covered,
  }
}
