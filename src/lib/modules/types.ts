import type { ComponentType } from 'react'
import type { AppView } from '../../components/main/appView.ts'
import type { HeaderSlotContribution } from '../header/headerSlotTypes.ts'
import type {
  MenuIconId,
  MenuNavScope,
  MenuPlacement,
} from '../menu/menuTypes.ts'
import type { AirtableTableConfig } from '../../config/tables.ts'
import type { ModuleTableBlueprint } from './tableBlueprints.ts'

export type ScreenModule = { default: ComponentType }

export interface ModuleScreenContribution {
  id: AppView
  title: string
  importScreen: () => Promise<ScreenModule>
}

/** Declares drawer groups for this module (`menuGroupId` on items). */
export interface ModuleMenuNavGroup {
  id: string
  label: string
  scope?: MenuNavScope
  order?: number
}

export interface ModuleMenuNavConfig {
  groups: readonly ModuleMenuNavGroup[]
}

export interface ModuleMenuItemContribution {
  id: string
  label: string
  icon: MenuIconId
  viewId: AppView
  order?: number
  /**
   * App-drawer section from this module's `menuNav.groups`.
   * Use with `placements` for Electron-only entries, or alone for drawer-only items.
   */
  menuGroupId?: string
  /** Where this item appears. Omit drawer placement when using `menuGroupId`. */
  placements?: readonly MenuPlacement[]
}

/** @deprecated Prefer `menuItems` with explicit `placements` (defaults to app drawer only). */
export interface ModuleMenuSectionContribution {
  id: string
  label: string
  items: readonly Omit<ModuleMenuItemContribution, 'placements'>[]
}

/**
 * Self-contained extension bundle. Default modules: `modules/<id>/`.
 * Custom modules: `module-repos/<id>/`. npm: `installedModules.ts`.
 * Enabled ids: `src/config/enabledModules.ts`.
 */
export interface AppModuleDefinition {
  id: string
  name: string
  version: string
  /** Other module ids that must be enabled (and provisioned) before this one. */
  dependsOn?: readonly string[]
  description?: string
  /** Relative to module folder, e.g. `README.md` — shown in Developer → Modules */
  readmePath?: string
  /** Markdown with Airtable base setup steps */
  airtableSetupPath?: string
  tables?: readonly AirtableTableConfig[]
  /** Schema used to create tables in Airtable when enabling the module. */
  tableBlueprints?: readonly ModuleTableBlueprint[]
  screens?: readonly ModuleScreenContribution[]
  /**
   * Drawer nav groups for this module. Items reference groups via `menuGroupId`.
   * Use `scope: 'global'` to merge items from multiple modules under one section.
   */
  menuNav?: ModuleMenuNavConfig
  /** Preferred: `menuNav` + `menuGroupId`, or explicit `placements`. */
  menuItems?: readonly ModuleMenuItemContribution[]
  /** @deprecated Use `menuItems` with `placements` instead. */
  menuSections?: readonly ModuleMenuSectionContribution[]
  /** Toolbar actions rendered before the user avatar (bell, badges, etc.). */
  headerSlots?: readonly HeaderSlotContribution[]
}

export interface DiscoveredModule {
  definition: AppModuleDefinition
  /** Path for UI / dev tooling, e.g. `modules/roles` or `module-repos/inventory` */
  rootPath: string
}

