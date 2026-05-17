import type { ElectronMenuContribution } from '../menu/menuTypes.ts'
import { getElectronAppBridge } from './appBridge.ts'

export function syncElectronMenuToMain(
  items: readonly ElectronMenuContribution[],
): void {
  const bridge = getElectronAppBridge()
  bridge?.syncElectronMenu?.(items)
}
