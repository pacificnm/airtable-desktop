import {
  findDiscoveredModule,
  getDiscoveredModules,
  isModuleEnabled,
} from './registry.ts'
import { moduleNeedsTableProvisioning } from './moduleProvisioningState.ts'

export function getModuleDependencies(moduleId: string): readonly string[] {
  return findDiscoveredModule(moduleId)?.definition.dependsOn ?? []
}

/** Topological order: dependencies first, then the requested module. */
export function sortModulesByDependencies(moduleIds: readonly string[]): string[] {
  const sorted: string[] = []
  const visiting = new Set<string>()
  const visited = new Set<string>()

  const visit = (id: string) => {
    if (visited.has(id)) return
    if (visiting.has(id)) {
      throw new Error(`Circular module dependency involving "${id}"`)
    }
    visiting.add(id)
    for (const dep of getModuleDependencies(id)) {
      visit(dep)
    }
    visiting.delete(id)
    visited.add(id)
    sorted.push(id)
  }

  for (const id of moduleIds) visit(id)
  return sorted
}

export function validateModuleDependenciesEnabled(moduleId: string): void {
  for (const depId of getModuleDependencies(moduleId)) {
    if (!isModuleEnabled(depId)) {
      throw new Error(
        `Module "${moduleId}" requires "${depId}" to be enabled first (order: config → roles → users).`,
      )
    }
  }
}

/** Enabled modules that list `moduleId` in `dependsOn`. */
export function getEnabledModulesDependingOn(moduleId: string): string[] {
  return getDiscoveredModules()
    .filter((m) => isModuleEnabled(m.definition.id))
    .filter((m) => getModuleDependencies(m.definition.id).includes(moduleId))
    .map((m) => m.definition.id)
}

export function moduleDependencyProvisionBlockers(moduleId: string): string[] {
  const blockers: string[] = []
  for (const depId of getModuleDependencies(moduleId)) {
    if (!isModuleEnabled(depId)) {
      blockers.push(`${depId} (not enabled)`)
    } else if (moduleNeedsTableProvisioning(depId)) {
      blockers.push(`${depId} (tables not provisioned)`)
    }
  }
  return blockers
}
