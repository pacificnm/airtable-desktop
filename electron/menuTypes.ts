/** Keep in sync with `src/lib/menu/menuTypes.ts` (ElectronMenuContribution). */
export type ElectronMenuBarId = 'view' | 'developer'

export interface ElectronMenuContribution {
  menu: ElectronMenuBarId
  label: string
  viewId: string
  order: number
}
