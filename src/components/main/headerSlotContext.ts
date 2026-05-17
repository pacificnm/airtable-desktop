import { createContext, useContext } from 'react'
import type { AppView } from './appView.ts'

export interface HeaderSlotContextValue {
  onNavigate: (view: AppView) => void
}

export const HeaderSlotContext = createContext<HeaderSlotContextValue | null>(null)

export function useHeaderSlotContext(): HeaderSlotContextValue | null {
  return useContext(HeaderSlotContext)
}
