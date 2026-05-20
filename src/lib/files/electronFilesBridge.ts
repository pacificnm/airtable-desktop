export interface ImportDataFileSuccess {
  ok: true
  /** Absolute path inside `<userData>/data-files/<moduleId>/`. */
  savedPath: string
  /** Filename written to disk (timestamp prefix + sanitized name). */
  savedAs: string
  /** Original file name selected by the user. */
  originalName: string
  /** Absolute path the user picked. */
  sourcePath: string
  /** Bytes of the copied file (from `fs.stat`). */
  size: number
}

export interface ImportDataFileFailure {
  ok: false
  /** True when the user dismissed the OS file picker. */
  cancelled?: boolean
  /** Set when the import attempt failed (validation, copy, etc.). */
  error?: string
}

export type ImportDataFileResult = ImportDataFileSuccess | ImportDataFileFailure

export interface DataFileEntry {
  /** Filename on disk (timestamp + sanitized original). */
  name: string
  /** Absolute path to the file. */
  path: string
  /** Size in bytes (from `fs.stat`). */
  size: number
  /** Last-modified time in ms since epoch (from `fs.stat`). */
  modifiedAt: number
}

export type ListDataFilesResult =
  | { ok: true; files: DataFileEntry[] }
  | { ok: false; error: string }

export type DeleteDataFileResult =
  | { ok: true }
  | { ok: false; error: string }

/** @deprecated Use {@link SpaceDataFileListCriteria}. */
export type SpaceDataFileMatchCriteria = SpaceDataFileListCriteria

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

export interface ElectronFilesBridge {
  importDataFile: (moduleId: string) => Promise<ImportDataFileResult>
  listDataFiles: (moduleId: string) => Promise<ListDataFilesResult>
  deleteDataFile: (
    moduleId: string,
    fileName: string,
  ) => Promise<DeleteDataFileResult>
  listDataFileSpaces: (
    criteria: SpaceDataFileListCriteria,
    fileName?: string,
  ) => Promise<ListDataFileSpacesResult>
  listDataFileBuildings: (
    criteria: BuildingDataFileListCriteria,
    fileName?: string,
  ) => Promise<ListDataFileBuildingsResult>
}

/**
 * Returns the IPC bridge that proxies into Electron's main process for file
 * I/O (currently: importing client-supplied CSV data files into a per-module
 * working directory under `<userData>/data-files/`).
 *
 * Returns `null` when running outside Electron (e.g. `npm run dev` in a
 * browser) so callers can render a "desktop only" affordance.
 */
export function getElectronFilesBridge(): ElectronFilesBridge | null {
  if (typeof window === 'undefined') return null
  const bridge = window.electronFiles
  if (bridge && typeof bridge.importDataFile === 'function') {
    return bridge
  }
  return null
}

declare global {
  interface Window {
    electronFiles?: ElectronFilesBridge
  }
}
