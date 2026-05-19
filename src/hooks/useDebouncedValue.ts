import { useEffect, useState } from 'react'

/**
 * Returns `value` after it has been stable for `delayMs`. Trailing-edge debounce.
 * Useful for text inputs that drive remote queries (Airtable `filterByFormula`).
 */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), Math.max(0, delayMs))
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
