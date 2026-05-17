import type { AppModuleDefinition, DiscoveredModule } from './types.ts'

const moduleIndexGlob = import.meta.glob<{ default: AppModuleDefinition }>(
  '../../../modules/*/index.ts',
  { eager: true },
)

function moduleIdFromPath(path: string): string {
  const match = path.match(/\/modules\/([^/]+)\//)
  return match?.[1] ?? path
}

/** Every module folder with an `index.ts` export (enabled or not). */
export function discoverModules(): readonly DiscoveredModule[] {
  return Object.entries(moduleIndexGlob)
    .map(([path, mod]) => {
      const definition = mod.default
      const id = moduleIdFromPath(path)
      return {
        definition: { ...definition, id: definition.id || id },
        rootPath: `modules/${id}`,
      } satisfies DiscoveredModule
    })
    .sort((a, b) => a.definition.name.localeCompare(b.definition.name))
}
