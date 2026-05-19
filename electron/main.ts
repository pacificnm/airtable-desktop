import { app, BrowserWindow, dialog, ipcMain, session, shell } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
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

interface SpaceDataFileMatchCriteria {
  /** Required Building Location ID (e.g. "1000002206"); the only definitive match key. */
  locationId?: string
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

function parseMatchingSpaceRows(
  csv: string,
  criteria: SpaceDataFileMatchCriteria,
): DataFileSpaceRow[] {
  const locationId = normalizeMatchValue(criteria.locationId)
  if (!locationId) return []

  const lines = csv.split(/\r?\n/).filter((line) => line.trim() !== '')
  if (lines.length === 0) return []

  const headers = parseCsvLine(lines[0]).map((header) => header.trim())
  const locationIdIdx = headers.indexOf('LOCATION_ID')
  if (locationIdIdx < 0) return []

  const rows: DataFileSpaceRow[] = []

  for (let i = 1; i < lines.length; i += 1) {
    const parsed = parseCsvLine(lines[i])
    if (normalizeMatchValue(parsed[locationIdIdx]) !== locationId) continue
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = parsed[index] ?? ''
    })
    rows.push(dataFileSpaceRow(row, i + 1))
  }

  return rows
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
    | { ok: true; sourceFile: string; rows: DataFileSpaceRow[] }
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

    const parsedCriteria = criteria as SpaceDataFileMatchCriteria
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

      const csv = await fs.readFile(selected.path, 'utf8')
      return {
        ok: true,
        sourceFile: selected.name,
        rows: parseMatchingSpaceRows(csv, parsedCriteria),
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
