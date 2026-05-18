import { installedModules } from '../../config/installedModules.ts'
import {
  customModuleDir,
  defaultModuleDir,
  moduleDiscoveryDirs,
  type ModuleDiscoveryDir,
} from '../../config/moduleLocations.ts'
import type { AppModuleDefinition, DiscoveredModule } from './types.ts'

const defaultModuleGlob = import.meta.glob<{ default: AppModuleDefinition }>(
  '../../../modules/*/index.ts',
  { eager: true },
)

const customModuleGlob = import.meta.glob<{ default: AppModuleDefinition }>(
  '../../../module-repos/*/index.ts',
  { eager: true },
)

const moduleIndexGlobs: Record<
  ModuleDiscoveryDir,
  Record<string, { default: AppModuleDefinition }>
> = {
  [defaultModuleDir]: defaultModuleGlob,
  [customModuleDir]: customModuleGlob,
}

function moduleMetaFromPath(
  path: string,
  rootDir: ModuleDiscoveryDir,
): { id: string; rootPath: string } {
  const match = path.match(new RegExp(`/${rootDir}/([^/]+)/`))
  const id = match?.[1] ?? path
  return { id, rootPath: `${rootDir}/${id}` }
}

function discoverFromDir(rootDir: ModuleDiscoveryDir): DiscoveredModule[] {
  const glob = moduleIndexGlobs[rootDir]
  return Object.entries(glob).map(([path, mod]) => {
    const definition = mod.default
    const { id, rootPath } = moduleMetaFromPath(path, rootDir)
    return {
      definition: { ...definition, id: definition.id || id },
      rootPath,
    } satisfies DiscoveredModule
  })
}

function discoverBundledModules(): DiscoveredModule[] {
  return moduleDiscoveryDirs.flatMap((dir) => discoverFromDir(dir))
}

function mergeDiscoveredModules(
  ...groups: readonly (readonly DiscoveredModule[])[]
): DiscoveredModule[] {
  const byId = new Map<string, DiscoveredModule>()
  for (const group of groups) {
    for (const mod of group) {
      byId.set(mod.definition.id, mod)
    }
  }
  return [...byId.values()]
}

/** Every default, custom, and npm-installed module (enabled or not). */
export function discoverModules(): readonly DiscoveredModule[] {
  return mergeDiscoveredModules(
    discoverBundledModules(),
    installedModules,
  ).sort((a, b) => a.definition.name.localeCompare(b.definition.name))
}

/** Re-export for callers that build paths (e.g. docs, tooling). */
export { customModuleDir, defaultModuleDir, moduleDiscoveryDirs }
