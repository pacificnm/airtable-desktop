/**
 * Where modules are discovered on disk.
 *
 * - `modules/` — default app (config, roles, users, notifications)
 * - `module-repos/` — your features (typically git submodules from GitHub)
 */
export const defaultModuleDir = 'modules' as const
export const customModuleDir = 'module-repos' as const

/** Search order when resolving a module folder by id (first match wins). */
export const moduleDiscoveryDirs = [defaultModuleDir, customModuleDir] as const

export type ModuleDiscoveryDir = (typeof moduleDiscoveryDirs)[number]
