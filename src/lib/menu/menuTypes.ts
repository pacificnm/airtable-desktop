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

export type AppDrawerMenuPlacement = {
  surface: 'appDrawer'
  section: { id: string; label: string }
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
