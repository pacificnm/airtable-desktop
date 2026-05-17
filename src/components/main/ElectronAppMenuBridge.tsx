import { useEffect } from 'react'
import type { AppView } from './appView.ts'
import { getElectronAppBridge } from '../../lib/electron/appBridge.ts'
import { menuActionToAppView } from '../../lib/electron/appMenuActions.ts'

export interface ElectronAppMenuBridgeProps {
  onNavigate: (view: AppView) => void
  onOpenDebugPanel?: () => void
}

/** Handles Electron application menu actions (navigation, debug panel). */
export function ElectronAppMenuBridge({
  onNavigate,
  onOpenDebugPanel,
}: ElectronAppMenuBridgeProps) {
  useEffect(() => {
    const bridge = getElectronAppBridge()
    if (!bridge) return
    return bridge.onMenuAction((action) => {
      const view = menuActionToAppView(action)
      if (view) {
        onNavigate(view)
        return
      }
      if (action === 'openDebugPanel') onOpenDebugPanel?.()
    })
  }, [onNavigate, onOpenDebugPanel])

  return null
}
