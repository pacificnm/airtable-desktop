import type { ReactNode } from 'react'
import { HeaderSlotContext, type HeaderSlotContextValue } from './headerSlotContext.ts'

export function HeaderSlotProvider({
  onNavigate,
  children,
}: HeaderSlotContextValue & { children: ReactNode }) {
  return (
    <HeaderSlotContext.Provider value={{ onNavigate }}>
      {children}
    </HeaderSlotContext.Provider>
  )
}
