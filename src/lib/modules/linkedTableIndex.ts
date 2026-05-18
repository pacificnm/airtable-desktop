import type { AirtableClient } from '../airtable/airtableClient.ts'
import type { MetaTableSchema } from '../airtable/metaTypes.ts'
import { isPlaceholderTableId } from './tableBlueprints.ts'
import {
  getProvisionedTableId,
  readAllProvisionedTableIds,
} from './provisionedTableIds.ts'
import { getEnabledModuleDefinitions, isModuleEnabled } from './registry.ts'
import { fetchModuleTableIdsFromAppConfig } from './moduleTableConfig.ts'
import { getModuleTableIdCache } from './moduleTableIdCache.ts'

function findTableByName(
  schemaTables: readonly MetaTableSchema[],
  name: string,
): MetaTableSchema | undefined {
  return schemaTables.find(
    (t) => t.name.localeCompare(name, undefined, { sensitivity: 'accent' }) === 0,
  )
}

function mergeIndex(
  target: Record<string, string>,
  source: Record<string, string>,
): void {
  for (const [key, id] of Object.entries(source)) {
    if (id.startsWith('tbl')) target[key] = id
  }
}

function indexFromModuleDefinitions(): Record<string, string> {
  const index: Record<string, string> = {}

  for (const mod of getEnabledModuleDefinitions()) {
    for (const table of mod.tables ?? []) {
      const provisioned = getProvisionedTableId(mod.id, table.key)
      if (provisioned) {
        index[table.key] = provisioned
        continue
      }
      if (!isPlaceholderTableId(table.tableId)) {
        index[table.key] = table.tableId
      }
    }
  }

  const stored = readAllProvisionedTableIds()
  for (const mod of getEnabledModuleDefinitions()) {
    for (const table of mod.tables ?? []) {
      if (index[table.key]) continue
      const id = stored[`${mod.id}:${table.key}`]
      if (id) index[table.key] = id
    }
  }

  return index
}

/**
 * Map table `key` (e.g. `roles`) → Airtable table id for link fields during provisioning.
 * Priority: App Config (`module.*.table.*`) → cache → module tables.ts → base schema.
 */
export async function buildLinkedTableIdIndex(
  client: AirtableClient,
  schemaTables: readonly MetaTableSchema[],
): Promise<Record<string, string>> {
  const index = indexFromModuleDefinitions()

  mergeIndex(index, getModuleTableIdCache())

  if (isModuleEnabled('config')) {
    try {
      const fromConfig = await fetchModuleTableIdsFromAppConfig(client)
      mergeIndex(index, fromConfig)
    } catch {
      /* App Config may not exist yet */
    }
  }

  for (const mod of getEnabledModuleDefinitions()) {
    for (const table of mod.tables ?? []) {
      if (index[table.key]) continue
      const tableName = table.tableName ?? table.label
      const inBase = findTableByName(schemaTables, tableName)
      if (inBase) index[table.key] = inBase.id
    }
  }

  return index
}
