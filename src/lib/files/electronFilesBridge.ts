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
  country?: string
  state?: string
  classification?: string
  status?: string
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
  nikeTerritory?: string
  locationStatus?: string
  classification?: string
  campus?: string
  brand?: string
  group?: string
  use?: string
  ownership?: string
  latitude?: number
  longitude?: number
  squareFootageImperial?: number
  rentableImperial?: number
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

export interface NikeRegionDataFileListCriteria {
  offset?: number
  limit?: number
  /** Case-insensitive substring match on NIKE_REGION name. */
  search?: string
}

export interface DataFileNikeRegionRow {
  sourceRow: number
  name: string
  /** Number of location CSV rows with this NIKE_REGION value. */
  occurrenceCount: number
}

export type ListDataFileNikeRegionsResult =
  | {
      ok: true
      sourceFile: string
      rows: DataFileNikeRegionRow[]
      offset: number
      limit: number
      hasMore: boolean
      fileSizeBytes: number
    }
  | { ok: false; error: string }

export interface NikeTerritoryDataFileListCriteria {
  offset?: number
  limit?: number
  /** Case-insensitive substring match on NIKE_TERRITORY name. */
  search?: string
}

export interface DataFileNikeTerritoryRow {
  sourceRow: number
  name: string
  /** Number of location CSV rows with this NIKE_TERRITORY value. */
  occurrenceCount: number
}

export type ListDataFileNikeTerritoriesResult =
  | {
      ok: true
      sourceFile: string
      rows: DataFileNikeTerritoryRow[]
      offset: number
      limit: number
      hasMore: boolean
      fileSizeBytes: number
    }
  | { ok: false; error: string }

export interface BuildingClassificationDataFileListCriteria {
  offset?: number
  limit?: number
  /** Case-insensitive substring match on classification name. */
  search?: string
}

export interface DataFileBuildingClassificationRow {
  sourceRow: number
  name: string
  /** Number of location CSV rows with this LOCATION_CLASSIFICATION value. */
  occurrenceCount: number
}

export type ListDataFileBuildingClassificationsResult =
  | {
      ok: true
      sourceFile: string
      rows: DataFileBuildingClassificationRow[]
      offset: number
      limit: number
      hasMore: boolean
      fileSizeBytes: number
    }
  | { ok: false; error: string }

export interface CountryDataFileListCriteria {
  offset?: number
  limit?: number
  /** Case-insensitive substring match on country name or ISO codes. */
  search?: string
}

export interface DataFileCountryRow {
  sourceRow: number
  country: string
  iso2?: string
  iso3?: string
  nikeRegion?: string
  nikeTerritory?: string
  /** Number of location CSV rows for this country. */
  occurrenceCount: number
}

export type ListDataFileCountriesResult =
  | {
      ok: true
      sourceFile: string
      rows: DataFileCountryRow[]
      offset: number
      limit: number
      hasMore: boolean
      fileSizeBytes: number
    }
  | { ok: false; error: string }

export interface StateDataFileListCriteria {
  offset?: number
  limit?: number
  /** Case-insensitive substring match on state name, country, or city. */
  search?: string
  /** Exact match on COUNTRY column. */
  country?: string
}

export interface DataFileStateRow {
  sourceRow: number
  name: string
  country: string
  city?: string
  /** Number of location CSV rows for this state + country pair. */
  occurrenceCount: number
}

export type ListDataFileStatesResult =
  | {
      ok: true
      sourceFile: string
      rows: DataFileStateRow[]
      offset: number
      limit: number
      hasMore: boolean
      fileSizeBytes: number
      /** Rows matching filters after dedupe (full file), before paging. */
      totalCount: number
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
  listDataFileNikeRegions: (
    criteria: NikeRegionDataFileListCriteria,
    fileName?: string,
  ) => Promise<ListDataFileNikeRegionsResult>
  listDataFileNikeTerritories: (
    criteria: NikeTerritoryDataFileListCriteria,
    fileName?: string,
  ) => Promise<ListDataFileNikeTerritoriesResult>
  listDataFileBuildingClassifications: (
    criteria: BuildingClassificationDataFileListCriteria,
    fileName?: string,
  ) => Promise<ListDataFileBuildingClassificationsResult>
  listDataFileCountries: (
    criteria: CountryDataFileListCriteria,
    fileName?: string,
  ) => Promise<ListDataFileCountriesResult>
  listDataFileStates: (
    criteria: StateDataFileListCriteria,
    fileName?: string,
  ) => Promise<ListDataFileStatesResult>
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
