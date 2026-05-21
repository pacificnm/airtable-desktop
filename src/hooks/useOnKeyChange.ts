import { useState } from 'react'

/**
 * Invokes `onChange` during render when `key` changes (React-recommended alternative
 * to resetting state inside useEffect).
 */
export function useOnKeyChange(key: string, onChange: () => void): void {
  const [prevKey, setPrevKey] = useState(key)
  if (key !== prevKey) {
    setPrevKey(key)
    onChange()
  }
}
