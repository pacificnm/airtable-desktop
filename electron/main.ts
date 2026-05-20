import { app, BrowserWindow, dialog, ipcMain, session, shell } from 'electron'
import { createReadStream } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline'
import {
  DEFAULT_SPACE_DATA_FILE_PAGE_SIZE,
  MAX_SPACE_DATA_FILE_PAGE_SIZE,
} from './dataFileLimits.js'
import { fileURLToPath } from 'node:url'
import { PRODUCTION_CSP } from './csp.js'
import {
  isElectronDebugEnabled,
  useStrictContentSecurityPolicy,
} from './debugEnabled.js'
import { moduleDiscoveryDirs } from './modulePaths.js'
import { setApplicationMenu, syncElectronMenuContributions } from './menu.js'
import type { ElectronMenuContribution } from './menuTypes.js'

// Avoid noisy Chromium GPU helper crashes on Windows driver/sandbox combinations.
app.disableHardwareAcceleration()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Fixed endpoint — main-process fetch is not subject to browser CORS. */
const AIRTABLE_TOKEN_URL = 'https://airtable.com/oauth2/v1/token'

const isDev = !app.isPackaged && Boolean(process.env.VITE_DEV_SERVER_URL)
const debugEnabled = isElectronDebugEnabled()

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function resolveModuleTablesPath(
  projectRoot: string,
  moduleId: string,
  moduleRoot?: string,
): Promise<string> {
  if (typeof moduleRoot === 'string' && moduleRoot.length > 0) {
    const filePath = path.join(projectRoot, moduleRoot, 'tables.ts')
    await fs.access(filePath)
    return filePath
  }
  for (const dir of moduleDiscoveryDirs) {
    const filePath = path.join(projectRoot, dir, moduleId, 'tables.ts')
    try {
      await fs.access(filePath)
      return filePath
    } catch {
      continue
    }
  }
  throw new Error(`No tables.ts found for module "${moduleId}"`)
}

ipcMain.on('app:sync-electron-menu', (_event, items: unknown) => {
  if (!Array.isArray(items)) return
  const parsed: ElectronMenuContribution[] = []
  for (const entry of items) {
    if (!entry || typeof entry !== 'object') continue
    const row = entry as Record<string, unknown>
    const menu = row.menu
    const label = row.label
    const viewId = row.viewId
    const order = row.order
    if (
      (menu === 'view' || menu === 'developer') &&
      typeof label === 'string' &&
      typeof viewId === 'string' &&
      typeof order === 'number'
    ) {
      parsed.push({ menu, label, viewId, order })
    }
  }
  syncElectronMenuContributions(parsed)
})

ipcMain.handle(
  'modules:patchModuleTableIds',
  async (
    _event,
    moduleId: string,
    tableIdsByKey: Record<string, string>,
    moduleRoot?: string,
  ): Promise<{ ok: boolean; path?: string; error?: string }> => {
    if (app.isPackaged) {
      return { ok: false, error: 'Patching module tables is only allowed in development.' }
    }
    if (typeof moduleId !== 'string' || !tableIdsByKey || typeof tableIdsByKey !== 'object') {
      return { ok: false, error: 'Invalid patch payload' }
    }
    try {
      const projectRoot = path.join(__dirname, '..')
      const filePath = await resolveModuleTablesPath(projectRoot, moduleId, moduleRoot)
      let content = await fs.readFile(filePath, 'utf8')
      for (const [tableKey, tableId] of Object.entries(tableIdsByKey)) {
        if (typeof tableId !== 'string' || !tableId.startsWith('tbl')) continue
        const re = new RegExp(
          `(key:\\s*'${escapeRegExp(tableKey)}'[\\s\\S]*?tableId:\\s*)'tbl[^']*'`,
          'm',
        )
        const next = content.replace(re, `$1'${tableId}'`)
        if (next === content) {
          return {
            ok: false,
            error: `Could not find tableId placeholder for key "${tableKey}" in ${filePath}`,
          }
        }
        content = next
      }
      await fs.writeFile(filePath, content, 'utf8')
      return { ok: true, path: filePath }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Patch failed'
      return { ok: false, error: message }
    }
  },
)

ipcMain.handle(
  'modules:resetModuleTableIds',
  async (
    _event,
    moduleId: string,
    placeholdersByKey: Record<string, string>,
    moduleRoot?: string,
  ): Promise<{ ok: boolean; path?: string; error?: string }> => {
    if (app.isPackaged) {
      return {
        ok: false,
        error: 'Resetting module tables is only allowed in development.',
      }
    }
    if (typeof moduleId !== 'string' || !placeholdersByKey) {
      return { ok: false, error: 'Invalid reset payload' }
    }
    try {
      const projectRoot = path.join(__dirname, '..')
      const filePath = await resolveModuleTablesPath(projectRoot, moduleId, moduleRoot)
      let content = await fs.readFile(filePath, 'utf8')
      for (const [tableKey, placeholder] of Object.entries(placeholdersByKey)) {
        if (typeof placeholder !== 'string' || !placeholder.startsWith('tbl')) continue
        const re = new RegExp(
          `(key:\\s*'${escapeRegExp(tableKey)}'[\\s\\S]*?tableId:\\s*)'tbl[^']*'`,
          'm',
        )
        const next = content.replace(re, `$1'${placeholder}'`)
        if (next === content) {
          return {
            ok: false,
            error: `Could not find tableId for key "${tableKey}" in ${filePath}`,
          }
        }
        content = next
      }
      await fs.writeFile(filePath, content, 'utf8')
      return { ok: true, path: filePath }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reset failed'
      return { ok: false, error: message }
    }
  },
)

async function writeModuleDevFile(
  moduleRoot: string,
  relativePath: string,
  fileContents: string,
): Promise<{ ok: boolean; path?: string; error?: string }> {
  if (app.isPackaged) {
    return {
      ok: false,
      error: 'Writing module files is only allowed in development.',
    }
  }
  if (
    typeof moduleRoot !== 'string' ||
    typeof relativePath !== 'string' ||
    typeof fileContents !== 'string'
  ) {
    return { ok: false, error: 'Invalid write payload' }
  }
  if (fileContents.trim().length === 0) {
    return { ok: false, error: 'Invalid file contents' }
  }
  if (relativePath.includes('..') || path.isAbsolute(relativePath)) {
    return { ok: false, error: 'Invalid file path' }
  }
  try {
    const projectRoot = path.join(__dirname, '..')
    const filePath = path.join(projectRoot, moduleRoot, relativePath)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, fileContents, 'utf8')
    return { ok: true, path: filePath }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Write failed'
    return { ok: false, error: message }
  }
}

ipcMain.handle(
  'modules:writeModuleTablesFile',
  async (
    _event,
    moduleRoot: string,
    fileContents: string,
  ): Promise<{ ok: boolean; path?: string; error?: string }> => {
    return writeModuleDevFile(moduleRoot, 'tables.ts', fileContents)
  },
)

ipcMain.handle(
  'modules:writeModuleFile',
  async (
    _event,
    moduleRoot: string,
    relativePath: string,
    fileContents: string,
  ): Promise<{ ok: boolean; path?: string; error?: string }> => {
    return writeModuleDevFile(moduleRoot, relativePath, fileContents)
  },
)

ipcMain.handle(
  'modules:writeEnabledModuleIds',
  async (
    _event,
    fileContents: string,
  ): Promise<{ ok: boolean; path?: string; error?: string }> => {
    if (app.isPackaged) {
      return { ok: false, error: 'Updating enabledModules.ts is only allowed in development.' }
    }
    if (typeof fileContents !== 'string' || fileContents.trim().length === 0) {
      return { ok: false, error: 'Invalid file contents' }
    }
    try {
      const projectRoot = path.join(__dirname, '..')
      const filePath = path.join(projectRoot, 'src/config/enabledModules.ts')
      await fs.writeFile(filePath, fileContents, 'utf8')
      return { ok: true, path: filePath }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Write failed'
      return { ok: false, error: message }
    }
  },
)

const VALID_MODULE_ID_RE = /^[a-z][a-z0-9-]*$/
const VALID_DATA_FILE_NAME_RE = /^[a-zA-Z0-9._-]+$/

function dataFileDir(moduleId: string): string {
  return path.join(app.getPath('userData'), 'data-files', moduleId)
}

function isInsideDir(filePath: string, dir: string): boolean {
  const rel = path.relative(dir, filePath)
  return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel)
}

function timestampPrefix(date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return (
    `${date.getFullYear()}` +
    `${pad(date.getMonth() + 1)}` +
    `${pad(date.getDate())}-` +
    `${pad(date.getHours())}` +
    `${pad(date.getMinutes())}` +
    `${pad(date.getSeconds())}`
  )
}

function safeBaseName(originalName: string): string {
  const base = path.basename(originalName)
  return base.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '') || 'data.csv'
}

interface DataFileEntry {
  name: string
  path: string
  size: number
  modifiedAt: number
}

interface SpaceDataFileListCriteria {
  /** When set, only rows with this Building Location ID (e.g. "1000002206"). */
  locationId?: string
  /** Number of matching rows to skip (for pagination). */
  offset?: number
  /** Max rows to return (default 100, max 500). */
  limit?: number
  /** Case-insensitive substring match across key columns. */
  search?: string
  description?: string
  category?: string
  status?: string
}

interface DataFileSpaceRow {
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

async function listDataFileEntries(moduleId: string): Promise<DataFileEntry[]> {
  const dir = dataFileDir(moduleId)
  let entries: string[]
  try {
    entries = await fs.readdir(dir)
  } catch (err: unknown) {
    if (
      err != null &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code?: string }).code === 'ENOENT'
    ) {
      return []
    }
    throw err
  }

  const files = await Promise.all(
    entries.map(async (name) => {
      const filePath = path.join(dir, name)
      try {
        const stat = await fs.stat(filePath)
        if (!stat.isFile()) return null
        return {
          name,
          path: filePath,
          size: stat.size,
          modifiedAt: stat.mtimeMs,
        }
      } catch {
        return null
      }
    }),
  )
  const valid = files.filter((f): f is NonNullable<typeof f> => f != null)
  valid.sort((a, b) => b.modifiedAt - a.modifiedAt)
  return valid
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let quoted = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (quoted && next === '"') {
        current += '"'
        i += 1
      } else {
        quoted = !quoted
      }
      continue
    }

    if (char === ',' && !quoted) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values
}

function normalizeMatchValue(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function cell(row: Record<string, string>, key: string): string | undefined {
  const value = row[key]?.trim()
  return value || undefined
}

function dataFileSpaceRow(
  row: Record<string, string>,
  sourceRow: number,
): DataFileSpaceRow {
  return {
    sourceRow,
    locationID: cell(row, 'LOCATION_ID'),
    spaceID: cell(row, 'SPACE_ID'),
    floorID: cell(row, 'FLOOR_ID'),
    spaceName: cell(row, 'SPACE_NM'),
    description: cell(row, 'SPACE_DESC'),
    category: cell(row, 'SPACE_CATEGORY'),
    status: cell(row, 'SPACE_STATUS'),
    areaSqft: toNumber(cell(row, 'SPACE_AREA_SQFT')),
    bookable: cell(row, 'SPACE_BOOKABLE'),
  }
}

function includesIgnoreCase(haystack: string | undefined, needle: string): boolean {
  if (!haystack) return false
  return haystack.toLowerCase().includes(needle)
}

function rowMatchesListCriteria(
  row: DataFileSpaceRow,
  criteria: SpaceDataFileListCriteria,
): boolean {
  const search = criteria.search?.trim().toLowerCase()
  if (search) {
    const matched =
      includesIgnoreCase(row.locationID, search) ||
      includesIgnoreCase(row.spaceID, search) ||
      includesIgnoreCase(row.spaceName, search) ||
      includesIgnoreCase(row.floorID, search) ||
      includesIgnoreCase(row.description, search)
    if (!matched) return false
  }
  const description = criteria.description?.trim()
  if (description && row.description !== description) return false
  const category = criteria.category?.trim()
  if (category && row.category !== category) return false
  const status = criteria.status?.trim()
  if (status && row.status !== status) return false
  return true
}

interface SpaceDataFilePageResult {
  rows: DataFileSpaceRow[]
  offset: number
  limit: number
  hasMore: boolean
  fileSizeBytes: number
}

/** Stream the CSV from disk; never loads the whole file into memory. */
async function readSpaceDataFilePage(
  filePath: string,
  criteria: SpaceDataFileListCriteria = {},
): Promise<SpaceDataFilePageResult> {
  const locationId = normalizeMatchValue(criteria.locationId)
  const offset = Math.max(0, Math.floor(criteria.offset ?? 0))
  const limit = Math.min(
    MAX_SPACE_DATA_FILE_PAGE_SIZE,
    Math.max(1, Math.floor(criteria.limit ?? DEFAULT_SPACE_DATA_FILE_PAGE_SIZE)),
  )

  const stat = await fs.stat(filePath)
  const stream = createReadStream(filePath, { encoding: 'utf8' })
  const lines = createInterface({ input: stream, crlfDelay: Infinity })

  let headers: string[] | null = null
  let locationIdIdx = -1
  let lineNo = 0
  let skipped = 0
  const rows: DataFileSpaceRow[] = []
  let hasMore = false

  for await (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    lineNo += 1

    if (headers == null) {
      headers = parseCsvLine(line).map((header) => header.trim())
      locationIdIdx = headers.indexOf('LOCATION_ID')
      if (locationIdIdx < 0) {
        throw new Error('Not a space data file (missing LOCATION_ID column).')
      }
      if (headers.indexOf('SPACE_ID') < 0) {
        throw new Error(
          'Not a space data file (missing SPACE_ID column). Choose a location_space_current_*.csv file.',
        )
      }
      continue
    }

    const parsed = parseCsvLine(line)
    if (locationId) {
      if (normalizeMatchValue(parsed[locationIdIdx]) !== locationId) continue
    }

    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = parsed[index] ?? ''
    })
    const row = dataFileSpaceRow(record, lineNo)
    if (!rowMatchesListCriteria(row, criteria)) continue

    if (skipped < offset) {
      skipped += 1
      continue
    }

    if (rows.length < limit) {
      rows.push(row)
      continue
    }

    hasMore = true
    break
  }

  return { rows, offset, limit, hasMore, fileSizeBytes: stat.size }
}

interface BuildingDataFileListCriteria {
  offset?: number
  limit?: number
  search?: string
  region?: string
  status?: string
  state?: string
  country?: string
}

interface DataFileBuildingRow {
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

function dataFileBuildingRow(
  row: Record<string, string>,
  sourceRow: number,
): DataFileBuildingRow {
  return {
    sourceRow,
    locationID: cell(row, 'LOCATION_ID'),
    locationIDLegacy: cell(row, 'LOCATION_ID_LEGACY'),
    buildingCode: cell(row, 'LOCATION_CD'),
    preferredName: cell(row, 'LOCATION_NM'),
    address: cell(row, 'ADDRESS'),
    city: cell(row, 'CITY'),
    state: cell(row, 'STATE'),
    postalCode: cell(row, 'ZIP_CD'),
    country: cell(row, 'COUNTRY'),
    nikeRegion: cell(row, 'NIKE_REGION'),
    locationStatus: cell(row, 'LOCATION_STATUS'),
    classification: cell(row, 'LOCATION_CLASSIFICATION'),
    brand: cell(row, 'LOCATION_BRAND'),
    group: cell(row, 'LOCATION_GROUP'),
    use: cell(row, 'LOCATION_USE'),
    ownership: cell(row, 'LOCATION_OWNERSHIP'),
    latitude: toNumber(cell(row, 'LATITUDE')),
    longitude: toNumber(cell(row, 'LONGITUDE')),
    squareFootageImperial: toNumber(cell(row, 'LOCATION_USABLE_IMPERIAL')),
    maxCapacity: toNumber(cell(row, 'MAX_CAPACITY')),
  }
}

function rowMatchesBuildingListCriteria(
  row: DataFileBuildingRow,
  criteria: BuildingDataFileListCriteria,
): boolean {
  const search = criteria.search?.trim().toLowerCase()
  if (search) {
    const matched =
      includesIgnoreCase(row.locationID, search) ||
      includesIgnoreCase(row.buildingCode, search) ||
      includesIgnoreCase(row.preferredName, search) ||
      includesIgnoreCase(row.address, search) ||
      includesIgnoreCase(row.city, search)
    if (!matched) return false
  }
  const region = criteria.region?.trim()
  if (region && row.nikeRegion !== region) return false
  const status = criteria.status?.trim()
  if (status && row.locationStatus !== status) return false
  const state = criteria.state?.trim()
  if (state && row.state !== state) return false
  const country = criteria.country?.trim()
  if (country && row.country !== country) return false
  return true
}

interface BuildingDataFilePageResult {
  rows: DataFileBuildingRow[]
  offset: number
  limit: number
  hasMore: boolean
  fileSizeBytes: number
}

async function readBuildingDataFilePage(
  filePath: string,
  criteria: BuildingDataFileListCriteria = {},
): Promise<BuildingDataFilePageResult> {
  const offset = Math.max(0, Math.floor(criteria.offset ?? 0))
  const limit = Math.min(
    MAX_SPACE_DATA_FILE_PAGE_SIZE,
    Math.max(1, Math.floor(criteria.limit ?? DEFAULT_SPACE_DATA_FILE_PAGE_SIZE)),
  )

  const stat = await fs.stat(filePath)
  const stream = createReadStream(filePath, { encoding: 'utf8' })
  const lines = createInterface({ input: stream, crlfDelay: Infinity })

  let headers: string[] | null = null
  let lineNo = 0
  let skipped = 0
  const rows: DataFileBuildingRow[] = []
  let hasMore = false

  for await (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    lineNo += 1

    if (headers == null) {
      headers = parseCsvLine(line).map((header) => header.trim())
      const locationIdIdx = headers.indexOf('LOCATION_ID')
      if (locationIdIdx < 0) {
        throw new Error('Not a location/building data file (missing LOCATION_ID column).')
      }
      if (headers.indexOf('LOCATION_NM') < 0) {
        throw new Error(
          'Not a location/building data file (missing LOCATION_NM column). Choose a location_current_*.csv file.',
        )
      }
      continue
    }

    const parsed = parseCsvLine(line)
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = parsed[index] ?? ''
    })
    const row = dataFileBuildingRow(record, lineNo)
    if (!rowMatchesBuildingListCriteria(row, criteria)) continue

    if (skipped < offset) {
      skipped += 1
      continue
    }

    if (rows.length < limit) {
      rows.push(row)
      continue
    }

    hasMore = true
    break
  }

  return { rows, offset, limit, hasMore, fileSizeBytes: stat.size }
}

ipcMain.handle(
  'files:importDataFile',
  async (
    event,
    moduleId: unknown,
  ): Promise<
    | {
        ok: true
        savedPath: string
        savedAs: string
        originalName: string
        sourcePath: string
        size: number
      }
    | { ok: false; cancelled?: boolean; error?: string }
  > => {
    if (typeof moduleId !== 'string' || !VALID_MODULE_ID_RE.test(moduleId)) {
      return { ok: false, error: 'Invalid module id.' }
    }
    try {
      const focused = BrowserWindow.fromWebContents(event.sender)
      const result = await (focused
        ? dialog.showOpenDialog(focused, {
            title: 'Choose a data file to import',
            properties: ['openFile'],
            filters: [
              { name: 'CSV files', extensions: ['csv'] },
              { name: 'All files', extensions: ['*'] },
            ],
          })
        : dialog.showOpenDialog({
            title: 'Choose a data file to import',
            properties: ['openFile'],
            filters: [
              { name: 'CSV files', extensions: ['csv'] },
              { name: 'All files', extensions: ['*'] },
            ],
          }))

      if (result.canceled || result.filePaths.length === 0) {
        return { ok: false, cancelled: true }
      }
      const sourcePath = result.filePaths[0]
      const originalName = path.basename(sourcePath)

      const destDir = dataFileDir(moduleId)
      await fs.mkdir(destDir, { recursive: true })

      const savedAs = `${timestampPrefix()}-${safeBaseName(originalName)}`
      const savedPath = path.join(destDir, savedAs)

      await fs.copyFile(sourcePath, savedPath)
      const stat = await fs.stat(savedPath)

      return {
        ok: true,
        savedPath,
        savedAs,
        originalName,
        sourcePath,
        size: stat.size,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      return { ok: false, error: message }
    }
  },
)

ipcMain.handle(
  'files:listDataFiles',
  async (
    _event,
    moduleId: unknown,
  ): Promise<
    | {
        ok: true
        files: { name: string; path: string; size: number; modifiedAt: number }[]
      }
    | { ok: false; error: string }
  > => {
    if (typeof moduleId !== 'string' || !VALID_MODULE_ID_RE.test(moduleId)) {
      return { ok: false, error: 'Invalid module id.' }
    }
    try {
      return { ok: true, files: await listDataFileEntries(moduleId) }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'List failed'
      return { ok: false, error: message }
    }
  },
)

ipcMain.handle(
  'files:listDataFileSpaces',
  async (
    _event,
    criteria: unknown,
    fileName?: unknown,
  ): Promise<
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
  > => {
    if (!criteria || typeof criteria !== 'object') {
      return { ok: false, error: 'Invalid match criteria.' }
    }
    if (fileName !== undefined && typeof fileName !== 'string') {
      return { ok: false, error: 'Invalid file name.' }
    }
    if (
      typeof fileName === 'string' &&
      !VALID_DATA_FILE_NAME_RE.test(fileName)
    ) {
      return { ok: false, error: 'Invalid file name.' }
    }

    const parsedCriteria = criteria as SpaceDataFileListCriteria
    try {
      const files = await listDataFileEntries('space')
      const selected =
        typeof fileName === 'string'
          ? files.find((file) => file.name === fileName)
          : files[0]

      if (!selected) {
        return { ok: false, error: 'No uploaded Space data file found.' }
      }

      const dir = dataFileDir('space')
      if (!isInsideDir(selected.path, dir)) {
        return { ok: false, error: 'Refused to read outside module data directory.' }
      }

      const page = await readSpaceDataFilePage(selected.path, parsedCriteria)
      return {
        ok: true,
        sourceFile: selected.name,
        rows: page.rows,
        offset: page.offset,
        limit: page.limit,
        hasMore: page.hasMore,
        fileSizeBytes: page.fileSizeBytes,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Read failed'
      return { ok: false, error: message }
    }
  },
)

ipcMain.handle(
  'files:listDataFileBuildings',
  async (
    _event,
    criteria: unknown,
    fileName?: unknown,
  ): Promise<
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
  > => {
    if (!criteria || typeof criteria !== 'object') {
      return { ok: false, error: 'Invalid match criteria.' }
    }
    if (fileName !== undefined && typeof fileName !== 'string') {
      return { ok: false, error: 'Invalid file name.' }
    }
    if (
      typeof fileName === 'string' &&
      !VALID_DATA_FILE_NAME_RE.test(fileName)
    ) {
      return { ok: false, error: 'Invalid file name.' }
    }

    const parsedCriteria = criteria as BuildingDataFileListCriteria
    try {
      const files = await listDataFileEntries('location')
      const selected =
        typeof fileName === 'string'
          ? files.find((file) => file.name === fileName)
          : files[0]

      if (!selected) {
        return { ok: false, error: 'No uploaded Location data file found.' }
      }

      const dir = dataFileDir('location')
      if (!isInsideDir(selected.path, dir)) {
        return { ok: false, error: 'Refused to read outside module data directory.' }
      }

      const page = await readBuildingDataFilePage(selected.path, parsedCriteria)
      return {
        ok: true,
        sourceFile: selected.name,
        rows: page.rows,
        offset: page.offset,
        limit: page.limit,
        hasMore: page.hasMore,
        fileSizeBytes: page.fileSizeBytes,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Read failed'
      return { ok: false, error: message }
    }
  },
)

ipcMain.handle(
  'files:deleteDataFile',
  async (
    _event,
    moduleId: unknown,
    fileName: unknown,
  ): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (typeof moduleId !== 'string' || !VALID_MODULE_ID_RE.test(moduleId)) {
      return { ok: false, error: 'Invalid module id.' }
    }
    if (typeof fileName !== 'string' || !VALID_DATA_FILE_NAME_RE.test(fileName)) {
      return { ok: false, error: 'Invalid file name.' }
    }
    try {
      const dir = dataFileDir(moduleId)
      const target = path.join(dir, fileName)
      if (!isInsideDir(target, dir)) {
        return { ok: false, error: 'Refused to delete outside module data directory.' }
      }
      await fs.rm(target, { force: false })
      return { ok: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      return { ok: false, error: message }
    }
  },
)

ipcMain.handle(
  'airtable:oauthToken',
  async (
    _event,
    payload: { body: string; authorization?: string },
  ): Promise<{ ok: boolean; status: number; text: string }> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    if (payload.authorization) {
      headers.Authorization = payload.authorization
    }
    const res = await fetch(AIRTABLE_TOKEN_URL, {
      method: 'POST',
      headers,
      body: payload.body,
    })
    const text = await res.text()
    return { ok: res.ok, status: res.status, text }
  },
)

function setupProductionContentSecurityPolicy(): void {
  if (!useStrictContentSecurityPolicy()) return

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders }
    responseHeaders['Content-Security-Policy'] = [PRODUCTION_CSP]
    callback({ responseHeaders })
  })
}

function preloadPath(): string {
  return path.join(__dirname, 'preload.cjs')
}

function productionIndexPath(): string {
  // Packaged: …/resources/app.asar with dist/ + dist-electron/ from electron-builder `files`.
  return path.join(app.getAppPath(), 'dist', 'index.html')
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    title: app.getName(),
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: debugEnabled,
    },
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    void win.loadURL(process.env.VITE_DEV_SERVER_URL)
    if (debugEnabled) {
      win.webContents.openDevTools({ mode: 'detach' })
    }
  } else {
    void win.loadFile(productionIndexPath())
  }
}

if (process.platform === 'win32') {
  app.setAppUserModelId('com.airtable.desktop')
}

void app.whenReady().then(() => {
  setupProductionContentSecurityPolicy()
  setApplicationMenu({ debugEnabled })
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
