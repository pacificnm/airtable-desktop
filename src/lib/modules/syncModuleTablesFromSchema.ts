import type { AirtableClient } from '../airtable/airtableClient.ts'
import { getElectronModulesBridge } from './electronModulesBridge.ts'
import {
  electronHandlerRestartMessage,
  isMissingElectronHandlerError,
} from './electronIpcErrors.ts'
import {
  generateModuleFieldsMetaFileContent,
  generateModuleTablesFileContent,
} from './generateModuleTablesFile.ts'
import { findDiscoveredModule, isModuleEnabled } from './registry.ts'
import { syncModuleTableIdsToAppConfig } from './moduleTableConfig.ts'
import { setProvisionedTableIds } from './provisionedTableIds.ts'

export interface SyncModuleSchemaResult {
  moduleId: string
  tables: readonly { tableKey: string; tableId: string; fieldCount: number }[]
  fileWritten: boolean
  filePath?: string
  metaFileWritten: boolean
  metaFilePath?: string
}

/**
 * Read base schema from Airtable and rewrite the module's tables.ts (dev only).
 * Does not create tables or alter columns — meta API read + local file write only.
 */
export async function syncModuleTablesFromSchema(
  client: AirtableClient,
  moduleId: string,
): Promise<SyncModuleSchemaResult> {
  const discovered = findDiscoveredModule(moduleId)
  if (!discovered) {
    throw new Error(`Unknown module: ${moduleId}`)
  }

  const tableConfigs = discovered.definition.tables
  if (!tableConfigs?.length) {
    throw new Error(`Module "${moduleId}" has no tables to sync.`)
  }

  const schema = await client.getBaseSchema()
  const fileContents = generateModuleTablesFileContent(
    moduleId,
    tableConfigs,
    schema.tables,
  )
  const metaFileContents = generateModuleFieldsMetaFileContent(
    moduleId,
    tableConfigs,
    schema.tables,
  )

  const idsToPersist: Record<string, string> = {}
  const tables: {
    tableKey: string
    tableId: string
    fieldCount: number
  }[] = []
  for (const tableConfig of tableConfigs) {
    const meta = schema.tables.find(
      (t) =>
        t.id === tableConfig.tableId ||
        t.name.localeCompare(
          tableConfig.tableName ?? tableConfig.label,
          undefined,
          { sensitivity: 'accent' },
        ) === 0,
    )
    if (!meta) continue
    idsToPersist[tableConfig.key] = meta.id
    tables.push({
      tableKey: tableConfig.key,
      tableId: meta.id,
      fieldCount: meta.fields.length,
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

  let fileWritten = false
  let filePath: string | undefined
  let metaFileWritten = false
  let metaFilePath: string | undefined
  const bridge = getElectronModulesBridge()
  const writeDevFile = bridge?.writeModuleFile ?? bridge?.writeModuleTablesFile
    ? async (relativePath: string, contents: string) => {
        if (bridge.writeModuleFile) {
          return bridge.writeModuleFile(discovered.rootPath, relativePath, contents)
        }
        if (relativePath !== 'tables.ts') {
          return {
            ok: false,
            error:
              'Restart Electron dev (npm run electron:dev) to enable writing tables.meta.ts.',
          }
        }
        return bridge.writeModuleTablesFile!(discovered.rootPath, contents)
      }
    : null

  if (writeDevFile) {
    try {
      const writeResult = await writeDevFile('tables.ts', fileContents)
      if (!writeResult.ok) {
        throw new Error(writeResult.error ?? 'Failed to write tables.ts')
      }
      fileWritten = true
      filePath = writeResult.path

      const metaWrite = await writeDevFile('tables.meta.ts', metaFileContents)
      if (!metaWrite.ok) {
        throw new Error(metaWrite.error ?? 'Failed to write tables.meta.ts')
      }
      metaFileWritten = true
      metaFilePath = metaWrite.path
    } catch (err) {
      if (isMissingElectronHandlerError(err)) {
        throw new Error(electronHandlerRestartMessage(), { cause: err })
      }
      throw err
    }
  }

  return {
    moduleId,
    tables,
    fileWritten,
    filePath,
    metaFileWritten,
    metaFilePath,
  }
}

export function moduleCanSyncSchemaFromAirtable(moduleId: string): boolean {
  const mod = findDiscoveredModule(moduleId)
  return Boolean(mod?.definition.tables?.length)
}
