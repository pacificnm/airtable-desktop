import type { AppView } from '../../components/main/appView.ts'
import { isValidAppView } from '../navigation/appViewPersistence.ts'

export const NAVIGATE_MENU_PREFIX = 'navigate:' as const

export type NavigateMenuAction = `${typeof NAVIGATE_MENU_PREFIX}${string}`

export type AppMenuAction = 'openDebugPanel' | NavigateMenuAction

export function menuActionToAppView(action: string): AppView | null {
  if (!action.startsWith(NAVIGATE_MENU_PREFIX)) return null
  const view = action.slice(NAVIGATE_MENU_PREFIX.length)
  return isValidAppView(view) ? (view as AppView) : null
}

export function isAppMenuAction(action: string): action is AppMenuAction {
  return action === 'openDebugPanel' || action.startsWith(NAVIGATE_MENU_PREFIX)
}
