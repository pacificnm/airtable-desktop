import type { ComponentType } from 'react'
import type { AppView } from '../../components/main/appView.ts'
import type { HeaderSlotContribution } from '../header/headerSlotTypes.ts'
import type { MenuIconId, MenuPlacement } from '../menu/menuTypes.ts'
import type { AirtableTableConfig } from '../../config/tables.ts'
import type { ModuleTableBlueprint } from './tableBlueprints.ts'

export type ScreenModule = { default: ComponentType }

export interface ModuleScreenContribution {
  id: AppView
  title: string
  importScreen: () => Promise<ScreenModule>
}

export interface ModuleMenuItemContribution {
  id: string
  label: string
  icon: MenuIconId
  viewId: AppView
  order?: number
  /** Where this item appears (app drawer, native Electron menu, or both). */
  placements: readonly MenuPlacement[]
}

/** @deprecated Prefer `menuItems` with explicit `placements` (defaults to app drawer only). */
export interface ModuleMenuSectionContribution {
  id: string
  label: string
  items: readonly Omit<ModuleMenuItemContribution, 'placements'>[]
}

/**
 * Self-contained extension bundle. Modules live under `modules/<id>/` and are
 * enabled in `src/config/enabledModules.ts`.
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
  /** Preferred: each item declares `placements` (app drawer vs Electron menu). */
  menuItems?: readonly ModuleMenuItemContribution[]
  /** @deprecated Use `menuItems` with `placements` instead. */
  menuSections?: readonly ModuleMenuSectionContribution[]
  /** Toolbar actions rendered before the user avatar (bell, badges, etc.). */
  headerSlots?: readonly HeaderSlotContribution[]
}

export interface DiscoveredModule {
  definition: AppModuleDefinition
  /** Absolute-ish path for UI, e.g. `modules/roles` */
  rootPath: string
}

