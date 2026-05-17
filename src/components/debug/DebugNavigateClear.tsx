import { useEffect, useRef } from 'react'
import type { AppView } from '../main/appView.ts'
import { useDebug } from '../../context/DebugContext.tsx'

/** Clears debug network + errors when the app view changes (if enabled). */
export function DebugNavigateClear({ view }: { view: AppView }) {
  const { clearOnNavigate, clearAll } = useDebug()
  const prevView = useRef<AppView | null>(null)

  useEffect(() => {
    if (prevView.current != null && prevView.current !== view && clearOnNavigate) {
      clearAll()
    }
    prevView.current = view
  }, [view, clearOnNavigate, clearAll])

  return null
}
