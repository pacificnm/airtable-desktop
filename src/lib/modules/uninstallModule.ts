import type { AirtableRestClient } from '../airtable/restClient.ts'
import { clearModuleAppConfigEntries } from './clearModuleAppConfig.ts'
import { getEnabledModulesDependingOn } from './moduleDependencies.ts'
import { disableModule } from './modulePreferences.ts'
import { placeholderTableId } from './placeholderTableId.ts'
import { clearProvisionedTableIdsForModule } from './provisionedTableIds.ts'
import { findDiscoveredModule } from './registry.ts'
import { removeTableKeysFromModuleTableIdCache } from './moduleTableIdCache.ts'
import { getElectronModulesBridge } from './electronModulesBridge.ts'

export interface UninstallModuleOptions {
  /** Remove `module.<id>.*` rows from App Config when connected. Default true. */
  clearAppConfig?: boolean
  /** Reset module `tables.ts` to placeholder ids (Electron dev only). Default true. */
  resetProjectTableIds?: boolean
}

export interface UninstallModuleResult {
  moduleId: string
  enabledModuleIds: readonly string[]
  configRowsRemoved: number
  tablesFileReset: boolean
}

export class UninstallModuleError extends Error {
  readonly code: 'dependents' | 'not_found' | 'reset_failed'
  readonly dependentModuleIds: readonly string[]

  constructor(
    message: string,
    code: 'dependents' | 'not_found' | 'reset_failed',
    dependentModuleIds: readonly string[] = [],
  ) {
    super(message)
    this.name = 'UninstallModuleError'
    this.code = code
    this.dependentModuleIds = dependentModuleIds
  }
}

export function getUninstallBlockers(moduleId: string): string[] {
  const dependents = getEnabledModulesDependingOn(moduleId)
  if (dependents.length > 0) {
    return [
      `Disable these modules first: ${dependents.join(', ')} (they depend on "${moduleId}").`,
    ]
  }
  return []
}

/**
 * Uninstall a module so it can be enabled again with a fresh provision:
 * disable, clear local provisioning state, optional App Config cleanup, reset tables.ts placeholders.
 */
export async function uninstallModule(
  moduleId: string,
  client: AirtableRestClient | null,
  options?: UninstallModuleOptions,
): Promise<UninstallModuleResult> {
  const clearAppConfig = options?.clearAppConfig ?? true
  const resetProjectTableIds = options?.resetProjectTableIds ?? true

  const mod = findDiscoveredModule(moduleId)
  if (!mod) {
    throw new UninstallModuleError(`Unknown module: ${moduleId}`, 'not_found')
  }

  const dependents = getEnabledModulesDependingOn(moduleId)
  if (dependents.length > 0) {
    throw new UninstallModuleError(
      `Cannot uninstall "${moduleId}" while ${dependents.join(', ')} still depend on it.`,
      'dependents',
      dependents,
    )
  }

  const tableKeys = (mod.definition.tables ?? []).map((t) => t.key)
  let configRowsRemoved = 0

  if (clearAppConfig && client) {
    try {
      configRowsRemoved = await clearModuleAppConfigEntries(client, moduleId)
    } catch (err) {
      console.warn('[modules] Could not clear App Config for uninstall:', err)
    }
  }

  clearProvisionedTableIdsForModule(moduleId)
  removeTableKeysFromModuleTableIdCache(tableKeys)

  if (moduleId === 'users' && typeof localStorage !== 'undefined') {
    localStorage.removeItem('users-module:session:v1')
  }

  let tablesFileReset = false
  if (resetProjectTableIds && tableKeys.length > 0) {
    const bridge = getElectronModulesBridge()
    if (bridge?.resetModuleTableIds) {
      const placeholders = Object.fromEntries(
        tableKeys.map((key) => [key, placeholderTableId(key)]),
      )
      const result = await bridge.resetModuleTableIds(
        moduleId,
        placeholders,
        mod.rootPath,
      )
      if (!result.ok) {
        throw new UninstallModuleError(
          result.error ?? 'Failed to reset module tables.ts',
          'reset_failed',
        )
      }
      tablesFileReset = true
    }
  }

  const enabledModuleIds = disableModule(moduleId)

  return {
    moduleId,
    enabledModuleIds,
    configRowsRemoved,
    tablesFileReset,
  }
}
