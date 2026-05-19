import { useContext } from 'react'
import {
  NavigationContext,
  type NavigationContextValue,
} from '../context/navigationContext.ts'

export type { NavigationContextValue } from '../context/navigationContext.ts'

/** Access the current route + navigate / goBack helpers. */
export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext)
  if (!ctx) {
    throw new Error('useNavigation must be used within <NavigationProvider>')
  }
  return ctx
}
