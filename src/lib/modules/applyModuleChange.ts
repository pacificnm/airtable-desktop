import { formatEnabledModulesFile } from './modulePreferences.ts'
import { getElectronModulesBridge } from './electronModulesBridge.ts'

export interface ApplyModuleChangeResult {
  ids: readonly string[]
}

/**
 * Persist enabled module list and reload the app so routes/tables/menu register.
 */
export async function applyModuleChange(
  ids: readonly string[],
  options?: { syncProjectFile?: boolean },
): Promise<ApplyModuleChangeResult> {
  const unique = [...new Set(ids)]

  if (options?.syncProjectFile) {
    const bridge = getElectronModulesBridge()
    if (bridge) {
      const result = await bridge.writeEnabledModuleIds(
        formatEnabledModulesFile(unique),
      )
      if (!result.ok) {
        throw new Error(result.error ?? 'Failed to update enabledModules.ts')
      }
    }
  }

  return { ids: unique }
}

export function reloadAppForModuleChange(): void {
  window.location.reload()
}
