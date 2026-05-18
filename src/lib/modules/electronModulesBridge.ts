export interface WriteEnabledModulesResult {
  ok: boolean
  path?: string
  error?: string
}

export interface PatchModuleTableIdsResult {
  ok: boolean
  path?: string
  error?: string
}

export interface WriteModuleTablesFileResult {
  ok: boolean
  path?: string
  error?: string
}

export interface ElectronModulesBridge {
  writeEnabledModuleIds: (fileContents: string) => Promise<WriteEnabledModulesResult>
  patchModuleTableIds: (
    moduleId: string,
    tableIdsByKey: Record<string, string>,
    /** e.g. `module-repos/inventory` — from discovered module `rootPath` */
    moduleRoot?: string,
  ) => Promise<PatchModuleTableIdsResult>
  resetModuleTableIds: (
    moduleId: string,
    placeholdersByKey: Record<string, string>,
    moduleRoot?: string,
  ) => Promise<PatchModuleTableIdsResult>
  writeModuleTablesFile: (
    moduleRoot: string,
    fileContents: string,
  ) => Promise<WriteModuleTablesFileResult>
  writeModuleFile: (
    moduleRoot: string,
    relativePath: string,
    fileContents: string,
  ) => Promise<WriteModuleTablesFileResult>
}

export function getElectronModulesBridge(): ElectronModulesBridge | null {
  if (typeof window === 'undefined') return null
  const bridge = window.electronModules
  if (bridge && typeof bridge.writeEnabledModuleIds === 'function') {
    return bridge
  }
  return null
}

declare global {
  interface Window {
    electronModules?: ElectronModulesBridge
  }
}
