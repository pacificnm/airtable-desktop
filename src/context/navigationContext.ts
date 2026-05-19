import { createContext } from 'react'
import type { AppView } from '../components/main/appView.ts'

export interface NavigationContextValue {
  /** Current screen route. */
  view: AppView
  /** Route-scoped params, e.g. `{ locationId: 'rec…' }`. */
  params: Readonly<Record<string, string>>
  /** Push a new entry onto the stack and persist it. */
  navigate: (view: AppView, params?: Record<string, string>) => void
  /** Pop the top entry. No-op when only the root entry remains. */
  goBack: () => void
  /** Replace the top entry (no history growth). */
  replace: (view: AppView, params?: Record<string, string>) => void
  /** Reset to a fresh stack rooted at the given view. */
  reset: (view: AppView, params?: Record<string, string>) => void
  canGoBack: boolean
}

export const NavigationContext = createContext<NavigationContextValue | null>(null)
