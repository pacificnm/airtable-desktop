import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  popEntry,
  pushEntry,
  readNavigationStack,
  replaceTop,
  topEntry,
  writeNavigationStack,
  type NavigationStack,
} from '../../lib/navigation/navigationStack.ts'
import {
  NavigationContext,
  type NavigationContextValue,
} from '../../context/navigationContext.ts'
import type { AppView } from './appView.ts'

export interface NavigationProviderProps {
  children: ReactNode
  /** Optional initial route override (mostly for tests / Electron deep links). */
  initial?: { view: AppView; params?: Record<string, string> }
}

export function NavigationProvider({
  children,
  initial,
}: NavigationProviderProps) {
  const [stack, setStack] = useState<NavigationStack>(() => {
    if (initial) {
      return { entries: [{ view: initial.view, params: initial.params ?? {} }] }
    }
    return readNavigationStack()
  })

  const update = useCallback((updater: (prev: NavigationStack) => NavigationStack) => {
    setStack((prev) => {
      const next = updater(prev)
      if (next !== prev) writeNavigationStack(next)
      return next
    })
  }, [])

  const navigate = useCallback(
    (view: AppView, params: Record<string, string> = {}) => {
      update((prev) => pushEntry(prev, view, params))
    },
    [update],
  )

  const goBack = useCallback(() => {
    update((prev) => popEntry(prev))
  }, [update])

  const replace = useCallback(
    (view: AppView, params: Record<string, string> = {}) => {
      update((prev) => replaceTop(prev, view, params))
    },
    [update],
  )

  const reset = useCallback(
    (view: AppView, params: Record<string, string> = {}) => {
      update(() => ({ entries: [{ view, params: { ...params } }] }))
    },
    [update],
  )

  const top = topEntry(stack)
  const canGoBack = stack.entries.length > 1

  const value = useMemo<NavigationContextValue>(
    () => ({
      view: top.view,
      params: top.params,
      navigate,
      goBack,
      replace,
      reset,
      canGoBack,
    }),
    [top.view, top.params, navigate, goBack, replace, reset, canGoBack],
  )

  return (
    <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
  )
}
