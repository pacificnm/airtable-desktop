import { useCallback, useState } from 'react'
import type { AppView } from '../../components/main/appView.ts'
import { screenImporters } from '../../config/screens.ts'

const STORAGE_KEY = 'app.lastView.v1'
const DEFAULT_VIEW: AppView = 'home'

const VALID_VIEWS = new Set(Object.keys(screenImporters) as AppView[])

export function isValidAppView(value: string): value is AppView {
  return VALID_VIEWS.has(value as AppView)
}

export function readLastAppView(): AppView {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && isValidAppView(raw)) return raw
  } catch {
    /* private mode / quota */
  }
  return DEFAULT_VIEW
}

export function writeLastAppView(view: AppView): void {
  try {
    localStorage.setItem(STORAGE_KEY, view)
  } catch {
    /* ignore */
  }
}

/** Current screen + setter that persists the last {@link AppView} for the next launch. */
export function usePersistedAppView(): [AppView, (view: AppView) => void] {
  const [view, setViewState] = useState<AppView>(() => readLastAppView())

  const setView = useCallback((next: AppView) => {
    setViewState(next)
    writeLastAppView(next)
  }, [])

  return [view, setView]
}
