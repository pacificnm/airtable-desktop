import type { DiscoveredModule } from '../lib/modules/types.ts'

/**
 * Modules installed from separate repos (npm, GitHub Packages, or `file:../…`).
 *
 * Vite must see a static import for each package. After `npm install`, add:
 *
 * ```ts
 * import inventory from '@acme/atd-module-inventory'
 *
 * export const installedModules = [
 *   {
 *     definition: inventory,
 *     rootPath: 'node_modules/@acme/atd-module-inventory',
 *   },
 * ] as const satisfies readonly DiscoveredModule[]
 * ```
 *
 * See docs/external-modules.md for package layout, SDK imports, and Vite settings.
 */
export const installedModules = [] as const satisfies readonly DiscoveredModule[]
