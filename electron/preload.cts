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

export interface ImportDataFileSuccess {
  ok: true
  savedPath: string
  savedAs: string
  originalName: string
  sourcePath: string
  size: number
}

export interface ImportDataFileFailure {
  ok: false
  cancelled?: boolean
  error?: string
}

export type ImportDataFileResult = ImportDataFileSuccess | ImportDataFileFailure

export interface DataFileEntry {
  name: string
  path: string
  size: number
  modifiedAt: number
}

export type ListDataFilesResult =
  | { ok: true; files: DataFileEntry[] }
  | { ok: false; error: string }

export type DeleteDataFileResult =
  | { ok: true }
  | { ok: false; error: string }

export interface SpaceDataFileListCriteria {
  locationId?: string
  offset?: number
  limit?: number
  search?: string
  description?: string
  category?: string
  status?: string
}

export interface DataFileSpaceRow {
  sourceRow: number
  locationID?: string
  spaceID?: string
  floorID?: string
  spaceName?: string
  description?: string
  category?: string
  status?: string
  areaSqft?: number
  bookable?: string
}

export type ListDataFileSpacesResult =
  | {
      ok: true
      sourceFile: string
      rows: DataFileSpaceRow[]
      offset: number
      limit: number
      hasMore: boolean
      fileSizeBytes: number
    }
  | { ok: false; error: string }

export interface BuildingDataFileListCriteria {
  offset?: number
  limit?: number
  search?: string
  region?: string
  status?: string
  state?: string
  country?: string
}

export interface DataFileBuildingRow {
  sourceRow: number
  locationID?: string
  locationIDLegacy?: string
  buildingCode?: string
  preferredName?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  nikeRegion?: string
  locationStatus?: string
  classification?: string
  brand?: string
  group?: string
  use?: string
  ownership?: string
  latitude?: number
  longitude?: number
  squareFootageImperial?: number
  maxCapacity?: number
}

export type ListDataFileBuildingsResult =
  | {
      ok: true
      sourceFile: string
      rows: DataFileBuildingRow[]
      offset: number
      limit: number
      hasMore: boolean
      fileSizeBytes: number
    }
  | { ok: false; error: string }

contextBridge.exposeInMainWorld('electronFiles', {
  importDataFile: (moduleId: string) =>
    ipcRenderer.invoke('files:importDataFile', moduleId) as Promise<ImportDataFileResult>,
  listDataFiles: (moduleId: string) =>
    ipcRenderer.invoke('files:listDataFiles', moduleId) as Promise<ListDataFilesResult>,
  deleteDataFile: (moduleId: string, fileName: string) =>
    ipcRenderer.invoke(
      'files:deleteDataFile',
      moduleId,
      fileName,
    ) as Promise<DeleteDataFileResult>,
  listDataFileSpaces: (
    criteria: SpaceDataFileListCriteria,
    fileName?: string,
  ) =>
    ipcRenderer.invoke(
      'files:listDataFileSpaces',
      criteria,
      fileName,
    ) as Promise<ListDataFileSpacesResult>,
  listDataFileBuildings: (
    criteria: BuildingDataFileListCriteria,
    fileName?: string,
  ) =>
    ipcRenderer.invoke(
      'files:listDataFileBuildings',
      criteria,
      fileName,
    ) as Promise<ListDataFileBuildingsResult>,
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
