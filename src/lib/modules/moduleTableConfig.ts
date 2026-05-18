import type { AirtableClient } from '../airtable/airtableClient.ts'
import { getTableConfig } from '../../config/tables.ts'
import { mergeModuleTableIdCache } from './moduleTableIdCache.ts'

/** App Config key storing an Airtable table id for module dependency resolution. */
export function moduleTableConfigKey(moduleId: string, tableKey: string): string {
  return `module.${moduleId}.table.${tableKey}`
}

export function parseModuleTableConfigKey(
  configKey: string,
): { moduleId: string; tableKey: string } | null {
  const match = /^module\.([^.]+)\.table\.(.+)$/.exec(configKey.trim())
  if (!match) return null
  return { moduleId: match[1]!, tableKey: match[2]! }
}

function escapeAirtableFormulaString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

/**
 * Read `module.<id>.table.<key>` rows from App Config into a tableKey → tableId map.
 */
export async function fetchModuleTableIdsFromAppConfig(
  client: AirtableClient,
): Promise<Record<string, string>> {
  const configTable = getTableConfig('appConfig')
  if (!configTable) return {}

  const index: Record<string, string> = {}
  let offset: string | undefined

  do {
    const res = await client.listRecords<Record<string, unknown>>(
      configTable.tableId,
      { pageSize: 100, offset },
    )
    for (const record of res.records) {
      const keyField = configTable.fields.key ?? 'Key'
      const valueField = configTable.fields.value ?? 'Value'
      const rawKey = record.fields[keyField]
      const rawValue = record.fields[valueField]
      if (typeof rawKey !== 'string') continue
      const parsed = parseModuleTableConfigKey(rawKey)
      if (!parsed) continue
      const tableId = String(rawValue ?? '').trim()
      if (tableId.startsWith('tbl')) {
        index[parsed.tableKey] = tableId
      }
    }
    offset = res.offset
  } while (offset)

  mergeModuleTableIdCache(index)
  return index
}

/** Upsert module table ids into App Config after provisioning. */
export async function syncModuleTableIdsToAppConfig(
  client: AirtableClient,
  moduleId: string,
  idsByTableKey: Record<string, string>,
): Promise<void> {
  const configTable = getTableConfig('appConfig')
  if (!configTable) {
    console.warn(
      '[modules] App Config table missing — enable the config module to store table ids for dependencies.',
    )
    return
  }

  const keyField = configTable.fields.key ?? 'Key'
  const valueField = configTable.fields.value ?? 'Value'
  const valueTypeField = configTable.fields.valueType ?? 'Value type'
  const moduleField = configTable.fields.module ?? 'Module'
  const activeField = configTable.fields.active ?? 'Active'
  const labelField = configTable.fields.label ?? 'Label'
  const descriptionField = configTable.fields.description ?? 'Description'

  const merged: Record<string, string> = {}

  for (const [tableKey, tableId] of Object.entries(idsByTableKey)) {
    if (!tableId.startsWith('tbl')) continue
    merged[tableKey] = tableId

    const configKey = moduleTableConfigKey(moduleId, tableKey)
    const formula = `{${keyField}}='${escapeAirtableFormulaString(configKey)}'`
    const existing = await client.listRecords<Record<string, unknown>>(
      configTable.tableId,
      { filterByFormula: formula, maxRecords: 1 },
    )

    const fields: Record<string, unknown> = {
      [keyField]: configKey,
      [valueField]: tableId,
      [valueTypeField]: 'string',
      [moduleField]: moduleId,
      [activeField]: true,
      [labelField]: `${moduleId} · ${tableKey}`,
      [descriptionField]:
        'Airtable table id for module provisioning and link fields (managed by the app).',
    }

    if (existing.records[0]) {
      await client.updateRecords(configTable.tableId, [
        { id: existing.records[0].id, fields },
      ])
    } else {
      await client.createRecords(configTable.tableId, [{ fields }])
    }
  }

  mergeModuleTableIdCache(merged)
}
