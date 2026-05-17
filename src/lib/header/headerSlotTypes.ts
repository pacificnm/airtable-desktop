import type { ComponentType } from 'react'

export type HeaderSlotModule = { default: ComponentType }

export interface HeaderSlotContribution {
  /** Unique within the module (combined with module id in registry). */
  id: string
  /** Lower numbers render closer to the user avatar (right). Default 100. */
  order?: number
  importSlot: () => Promise<HeaderSlotModule>
}

export interface ResolvedHeaderSlot {
  key: string
  order: number
  importSlot: () => Promise<HeaderSlotModule>
}
