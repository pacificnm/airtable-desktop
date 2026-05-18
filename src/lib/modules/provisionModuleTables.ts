import type { AirtableRestClient } from '../airtable/restClient.ts'
import type { MetaTableSchema } from '../airtable/metaTypes.ts'
import { buildCreateTableFields, sortBlueprintsForProvisioning } from './buildCreateTableFields.ts'
import { buildLinkedTableIdIndex } from './linkedTableIndex.ts'
import { getModuleDependencies } from './moduleDependencies.ts'
import { syncModuleTableIdsToAppConfig } from './moduleTableConfig.ts'
import { findDiscoveredModule, isModuleEnabled } from './registry.ts'
import { moduleNeedsTableProvisioning } from './moduleProvisioningState.ts'
import { setProvisionedTableIds } from './provisionedTableIds.ts'
import { getElectronModulesBridge } from './electronModulesBridge.ts'

export interface ProvisionTableResult {
  tableKey: string
  tableId: string
  tableName: string
  status: 'created' | 'existing'
}

export interface ProvisionModuleResult {
  moduleId: string
  tables: ProvisionTableResult[]
}

function findTableByName(
  schemaTables: MetaTableSchema[],
  name: string,
): MetaTableSchema | undefined {
  return schemaTables.find(
    (t) => t.name.localeCompare(name, undefined, { sensitivity: 'accent' }) === 0,
  )
}

async function seedTable(
  client: AirtableRestClient,
  tableId: string,
  seeds: readonly { fields: Record<string, unknown> }[],
): Promise<void> {
  for (let i = 0; i < seeds.length; i += 10) {
    const batch = seeds.slice(i, i + 10)
    await client.createRecords(tableId, batch)
  }
}

/**
 * Create module tables in the connected base (requires `schema.bases:write`).
 * Reuses existing tables when the name already exists in the base.
 * Provisions dependency modules first and stores table ids in App Config.
 */
export async function provisionModuleTables(
  client: AirtableRestClient,
  moduleId: string,
  chain: Set<string> = new Set(),
): Promise<ProvisionModuleResult> {
  if (chain.has(moduleId)) {
    throw new Error(`Circular module dependency at "${moduleId}"`)
  }
  chain.add(moduleId)

  const discovered = findDiscoveredModule(moduleId)
  if (!discovered) {
    throw new Error(`Unknown module: ${moduleId}`)
  }

  for (const depId of getModuleDependencies(moduleId)) {
    if (!isModuleEnabled(depId)) {
      throw new Error(
        `Module "${moduleId}" requires "${depId}" to be enabled first (install order: config → roles → users).`,
      )
    }
    if (moduleNeedsTableProvisioning(depId)) {
      await provisionModuleTables(client, depId, chain)
    }
  }

  const blueprints = discovered.definition.tableBlueprints
  if (!blueprints?.length) {
    throw new Error(`Module "${moduleId}" has no table blueprints to provision`)
  }

  const schema = await client.getBaseSchema()
  const ordered = sortBlueprintsForProvisioning(blueprints)
  const linkedTableIds = await buildLinkedTableIdIndex(client, schema.tables)
  const results: ProvisionTableResult[] = []
  const idsToPersist: Record<string, string> = {}

  for (const blueprint of ordered) {
    const existing = findTableByName(schema.tables, blueprint.name)
    if (existing) {
      linkedTableIds[blueprint.tableKey] = existing.id
      idsToPersist[blueprint.tableKey] = existing.id
      results.push({
        tableKey: blueprint.tableKey,
        tableId: existing.id,
        tableName: blueprint.name,
        status: 'existing',
      })
      continue
    }

    const created = await client.createTable({
      name: blueprint.name,
      fields: buildCreateTableFields(blueprint.fields, linkedTableIds),
    })

    linkedTableIds[blueprint.tableKey] = created.id
    idsToPersist[blueprint.tableKey] = created.id
    schema.tables.push(created)

    if (blueprint.seedRecords?.length) {
      await seedTable(client, created.id, blueprint.seedRecords)
    }

    results.push({
      tableKey: blueprint.tableKey,
      tableId: created.id,
      tableName: blueprint.name,
      status: 'created',
    })
  }

  setProvisionedTableIds(moduleId, idsToPersist)

  if (isModuleEnabled('config') && Object.keys(idsToPersist).length > 0) {
    try {
      await syncModuleTableIdsToAppConfig(client, moduleId, idsToPersist)
    } catch (err) {
      console.warn('[modules] Could not sync table ids to App Config:', err)
    }
  }

  const bridge = getElectronModulesBridge()
  if (bridge) {
    const patchResult = await bridge.patchModuleTableIds(
      moduleId,
      idsToPersist,
      discovered.rootPath,
    )
    if (!patchResult.ok) {
      console.warn('[modules] Could not patch tables.ts:', patchResult.error)
    }
  }

  return { moduleId, tables: results }
}
