import type { AppView } from '../components/main/appView.ts'

export interface HeaderTabConfig {
  id: string
  label: string
  isSelected: (view: AppView) => boolean
  resolveNavigate: (view: AppView) => AppView
}

/** App bar tabs — empty in the base shell; add entries when you add top-level routes. */
export const headerTabs: readonly HeaderTabConfig[] = []

export function getHeaderTabIndex(view: AppView): number | false {
  const index = headerTabs.findIndex((tab) => tab.isSelected(view))
  return index >= 0 ? index : false
}

export function resolveHeaderTabNavigate(
  index: number,
  currentView: AppView,
): AppView {
  const tab = headerTabs[index]
  return tab ? tab.resolveNavigate(currentView) : currentView
}
