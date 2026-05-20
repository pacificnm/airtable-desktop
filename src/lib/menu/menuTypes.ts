import type { AppView } from '../../components/main/appView.ts'

export type MenuIconId =
  | 'home'
  | 'tableChart'
  | 'menuBook'
  | 'palette'
  | 'style'
  | 'gridView'
  | 'extension'
  | 'adminPanelSettings'
  | 'security'
  | 'settings'
  | 'people'
  | 'notifications'

/** Electron menu bar targets modules can contribute to (besides system roles). */
export type ElectronMenuBarId = 'view' | 'developer'

/** How a drawer section id is namespaced when merging items from multiple modules. */
export type MenuNavScope = 'module' | 'global'

export interface MenuNavSectionRef {
  id: string
  label: string
  /**
   * `module` (default): section key is `moduleId:sectionId` — only this module's items.
   * `global`: section key is `global:sectionId` — merge items from any module using the same id.
   */
  scope?: MenuNavScope
  /** Sort order among drawer sections (lower first). */
  order?: number
}

export type AppDrawerMenuPlacement = {
  surface: 'appDrawer'
  section: MenuNavSectionRef
  /** Item order within the section (lower first). */
  order?: number
}

export type ElectronMenuPlacement = {
  surface: 'electron'
  menu: ElectronMenuBarId
  order?: number
}

export type MenuPlacement = AppDrawerMenuPlacement | ElectronMenuPlacement

export interface MenuNavItem {
  id: string
  label: string
  icon: MenuIconId
  isSelected: (view: AppView) => boolean
  resolveNavigate: (view: AppView) => AppView
}

export interface MenuSection {
  id: string
  label: string
  items: readonly MenuNavItem[]
}

/** Serialized item sent to Electron main to build native menus. */
export interface ElectronMenuContribution {
  menu: ElectronMenuBarId
  label: string
  viewId: string
  order: number
}
