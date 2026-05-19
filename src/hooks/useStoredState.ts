import { useCallback, useEffect, useRef, useState } from 'react'
import {
  readStoredState,
  removeStoredState,
  writeStoredState,
  type Validator,
} from '../lib/persistence/storedState.ts'

export interface UseStoredStateOptions<T> {
  validate?: Validator<T>
  /** Skip persistence (useful while a dependency like baseId isn't ready). */
  enabled?: boolean
}

/**
 * `useState` that mirrors its value to localStorage under `storageKey`.
 *
 * - Hydrates from storage on mount.
 * - Re-hydrates when `storageKey` changes (e.g. user switches base / table).
 * - Skips writes when `enabled` is false.
 */
export function useStoredState<T>(
  storageKey: string | null,
  initial: T,
  options: UseStoredStateOptions<T> = {},
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { validate, enabled = true } = options
  const initialRef = useRef(initial)

  useEffect(() => {
    initialRef.current = initial
  }, [initial])

  const [value, setValue] = useState<T>(() => {
    if (!enabled || !storageKey) return initial
    return readStoredState(storageKey, initial, { validate })
  })

  // Re-hydrate whenever the storage key changes (e.g. base id resolves).
  useEffect(() => {
    if (!enabled || !storageKey) return
    setValue(readStoredState(storageKey, initialRef.current, { validate }))
  }, [storageKey, enabled, validate])

  // Persist on change.
  useEffect(() => {
    if (!enabled || !storageKey) return
    writeStoredState(storageKey, value)
  }, [storageKey, value, enabled])

  const reset = useCallback(() => {
    if (storageKey) removeStoredState(storageKey)
    setValue(initialRef.current)
  }, [storageKey])

  return [value, setValue, reset]
}
