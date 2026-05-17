import type { ElectronMenuContribution } from '../menu/menuTypes.ts'
import type { AppMenuAction } from './appMenuActions.ts'

export type { AppMenuAction } from './appMenuActions.ts'

export interface ElectronAppBridge {
  onMenuAction: (callback: (action: AppMenuAction) => void) => () => void
  syncElectronMenu?: (items: readonly ElectronMenuContribution[]) => void
}

export function getElectronAppBridge(): ElectronAppBridge | null {
  if (typeof window === 'undefined') return null
  const bridge = window.electronApp
  if (bridge && typeof bridge.onMenuAction === 'function') {
    return bridge
  }
  return null
}

declare global {
  interface Window {
    electronApp?: ElectronAppBridge
  }
}
