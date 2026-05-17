import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { debugStore } from '../lib/debug/debugStore.ts'
import {
  readClearOnNavigate,
  writeClearOnNavigate,
} from '../lib/debug/debugPreferences.ts'
import { collectPerfSnapshot } from '../lib/debug/installDebugInstrumentation.ts'
import type { DebugSnapshot } from '../lib/debug/types.ts'

type DebugContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  snapshot: DebugSnapshot
  clearNetwork: () => void
  clearErrors: () => void
  clearAll: () => void
  refreshPerf: () => void
  clearOnNavigate: boolean
  setClearOnNavigate: (enabled: boolean) => void
}

const DebugContext = createContext<DebugContextValue | null>(null)

export function DebugProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [clearOnNavigate, setClearOnNavigateState] = useState(readClearOnNavigate)
  const snapshot = useSyncExternalStore(
    (onStoreChange) => debugStore.subscribe(onStoreChange),
    () => debugStore.getSnapshot(),
    () => debugStore.getSnapshot(),
  )

  const refreshPerf = useCallback(() => {
    debugStore.setPerf(collectPerfSnapshot())
  }, [])

  const setClearOnNavigate = useCallback((enabled: boolean) => {
    writeClearOnNavigate(enabled)
    setClearOnNavigateState(enabled)
  }, [])

  const value = useMemo<DebugContextValue>(
    () => ({
      open,
      setOpen,
      toggle: () => setOpen((v) => !v),
      snapshot,
      clearNetwork: () => debugStore.clearNetwork(),
      clearErrors: () => debugStore.clearErrors(),
      clearAll: () => debugStore.clearAll(),
      refreshPerf,
      clearOnNavigate,
      setClearOnNavigate,
    }),
    [open, snapshot, refreshPerf, clearOnNavigate, setClearOnNavigate],
  )

  return (
    <DebugContext.Provider value={value}>{children}</DebugContext.Provider>
  )
}

export function useDebug(): DebugContextValue {
  const ctx = useContext(DebugContext)
  if (!ctx) throw new Error('useDebug must be used within DebugProvider')
  return ctx
}
