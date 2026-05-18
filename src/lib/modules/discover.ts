import { installedModules } from '../../config/installedModules.ts'
import type { AppModuleDefinition, DiscoveredModule } from './types.ts'

const moduleIndexGlob = import.meta.glob<{ default: AppModuleDefinition }>(
  '../../../modules/*/index.ts',
  { eager: true },
)

function moduleIdFromPath(path: string): string {
  const match = path.match(/\/modules\/([^/]+)\//)
  return match?.[1] ?? path
}

function discoverBundledModules(): DiscoveredModule[] {
  return Object.entries(moduleIndexGlob).map(([path, mod]) => {
    const definition = mod.default
    const id = moduleIdFromPath(path)
    return {
      definition: { ...definition, id: definition.id || id },
      rootPath: `modules/${id}`,
    } satisfies DiscoveredModule
  })
}

function mergeDiscoveredModules(
  bundled: readonly DiscoveredModule[],
  installed: readonly DiscoveredModule[],
): DiscoveredModule[] {
  const byId = new Map<string, DiscoveredModule>()
  for (const mod of bundled) {
    byId.set(mod.definition.id, mod)
  }
  for (const mod of installed) {
    byId.set(mod.definition.id, {
      ...mod,
      definition: {
        ...mod.definition,
        id: mod.definition.id,
      },
    })
  }
  return [...byId.values()]
}

/** Every bundled folder and installed package (enabled or not). */
export function discoverModules(): readonly DiscoveredModule[] {
  return mergeDiscoveredModules(discoverBundledModules(), installedModules).sort(
    (a, b) => a.definition.name.localeCompare(b.definition.name),
  )
}
