import { useEffect } from 'react'
import { getElectronMenuContributions } from '../../lib/modules/registry.ts'
import { syncElectronMenuToMain } from '../../lib/electron/syncElectronMenu.ts'

/** Pushes drawer/electron menu contributions from enabled modules to the native menu bar. */
export function ElectronMenuSync() {
  useEffect(() => {
    syncElectronMenuToMain(getElectronMenuContributions())
  }, [])

  return null
}
