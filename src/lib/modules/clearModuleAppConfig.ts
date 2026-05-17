import type { AirtableRestClient } from '../airtable/restClient.ts'
import { getTableConfig } from '../../config/tables.ts'
import { parseModuleTableConfigKey } from './moduleTableConfig.ts'

function configKeyBelongsToModule(configKey: string, moduleId: string): boolean {
  const key = configKey.trim()
  if (key === `module.${moduleId}.enabled`) return true
  if (key.startsWith(`module.${moduleId}.`)) return true
  const parsed = parseModuleTableConfigKey(key)
  return parsed?.moduleId === moduleId
}

/**
 * Remove App Config rows owned by a module (table ids, enabled flag, settings).
 * Does not delete Airtable data tables themselves.
 */
export async function clearModuleAppConfigEntries(
  client: AirtableRestClient,
  moduleId: string,
): Promise<number> {
  const configTable = getTableConfig('appConfig')
  if (!configTable) return 0

  const keyField = configTable.fields.key ?? 'Key'
  const moduleField = configTable.fields.module ?? 'Module'
  const ids: string[] = []
  let offset: string | undefined

  do {
    const res = await client.listRecords<Record<string, unknown>>(
      configTable.tableId,
      { pageSize: 100, offset },
    )
    for (const record of res.records) {
      const rawKey = record.fields[keyField]
      const rawModule = record.fields[moduleField]
      const belongs =
        (typeof rawKey === 'string' && configKeyBelongsToModule(rawKey, moduleId)) ||
        (typeof rawModule === 'string' &&
          rawModule.trim().toLowerCase() === moduleId.toLowerCase())
      if (belongs) ids.push(record.id)
    }
    offset = res.offset
  } while (offset)

  for (let i = 0; i < ids.length; i += 10) {
    await client.deleteRecords(configTable.tableId, ids.slice(i, i + 10))
  }

  return ids.length
}
