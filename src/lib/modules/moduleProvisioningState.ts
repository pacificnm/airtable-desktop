import { findDiscoveredModule } from './registry.ts'
import { isPlaceholderTableId } from './tableBlueprints.ts'

export function moduleNeedsTableProvisioning(moduleId: string): boolean {
  const mod = findDiscoveredModule(moduleId)
  if (!mod?.definition.tableBlueprints?.length) return false
  const provisioned = mod.definition.tables ?? []
  return provisioned.some((t) => isPlaceholderTableId(t.tableId))
}
