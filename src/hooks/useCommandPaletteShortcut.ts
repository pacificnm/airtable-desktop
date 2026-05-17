import { useEffect } from 'react'

function isModKey(e: globalThis.KeyboardEvent): boolean {
  return e.metaKey || e.ctrlKey
}

/** Global shortcut: ⌘K / Ctrl+K */
export function useCommandPaletteShortcut(
  setOpen: (open: boolean) => void,
): void {
  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (isModKey(e) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setOpen])
}
