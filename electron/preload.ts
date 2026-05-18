import { contextBridge, ipcRenderer } from 'electron'

export interface AirtableOAuthTokenPayload {
  body: string
  authorization?: string
}

export interface AirtableOAuthTokenResult {
  ok: boolean
  status: number
  text: string
}

export type AppMenuAction = 'openDebugPanel' | `navigate:${string}`

contextBridge.exposeInMainWorld('electronAirtable', {
  exchangeOAuthToken: (payload: AirtableOAuthTokenPayload) =>
    ipcRenderer.invoke(
      'airtable:oauthToken',
      payload,
    ) as Promise<AirtableOAuthTokenResult>,
})

contextBridge.exposeInMainWorld('electronModules', {
  writeEnabledModuleIds: (fileContents: string) =>
    ipcRenderer.invoke(
      'modules:writeEnabledModuleIds',
      fileContents,
    ) as Promise<{ ok: boolean; path?: string; error?: string }>,
  patchModuleTableIds: (
    moduleId: string,
    tableIdsByKey: Record<string, string>,
    moduleRoot?: string,
  ) =>
    ipcRenderer.invoke(
      'modules:patchModuleTableIds',
      moduleId,
      tableIdsByKey,
      moduleRoot,
    ) as Promise<{ ok: boolean; path?: string; error?: string }>,
  resetModuleTableIds: (
    moduleId: string,
    placeholdersByKey: Record<string, string>,
    moduleRoot?: string,
  ) =>
    ipcRenderer.invoke(
      'modules:resetModuleTableIds',
      moduleId,
      placeholdersByKey,
      moduleRoot,
    ) as Promise<{ ok: boolean; path?: string; error?: string }>,
  writeModuleTablesFile: (moduleRoot: string, fileContents: string) =>
    ipcRenderer.invoke(
      'modules:writeModuleTablesFile',
      moduleRoot,
      fileContents,
    ) as Promise<{ ok: boolean; path?: string; error?: string }>,
  writeModuleFile: (
    moduleRoot: string,
    relativePath: string,
    fileContents: string,
  ) =>
    ipcRenderer.invoke(
      'modules:writeModuleFile',
      moduleRoot,
      relativePath,
      fileContents,
    ) as Promise<{ ok: boolean; path?: string; error?: string }>,
})

contextBridge.exposeInMainWorld('electronApp', {
  onMenuAction: (callback: (action: AppMenuAction) => void) => {
    const listener = (_event: unknown, action: AppMenuAction) => {
      callback(action)
    }
    ipcRenderer.on('app:menu-action', listener)
    return () => {
      ipcRenderer.removeListener('app:menu-action', listener)
    }
  },
  syncElectronMenu: (items: unknown) => {
    ipcRenderer.send('app:sync-electron-menu', items)
  },
})
