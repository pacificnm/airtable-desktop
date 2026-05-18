import { app, BrowserWindow, ipcMain, session, shell } from 'electron'
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

ipcMain.handle(
  'modules:writeModuleTablesFile',
  async (
    _event,
    moduleRoot: string,
    fileContents: string,
  ): Promise<{ ok: boolean; path?: string; error?: string }> => {
    if (app.isPackaged) {
      return {
        ok: false,
        error: 'Writing module tables.ts is only allowed in development.',
      }
    }
    if (typeof moduleRoot !== 'string' || typeof fileContents !== 'string') {
      return { ok: false, error: 'Invalid write payload' }
    }
    if (fileContents.trim().length === 0) {
      return { ok: false, error: 'Invalid file contents' }
    }
    try {
      const projectRoot = path.join(__dirname, '..')
      const filePath = path.join(projectRoot, moduleRoot, 'tables.ts')
      await fs.writeFile(filePath, fileContents, 'utf8')
      return { ok: true, path: filePath }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Write failed'
      return { ok: false, error: message }
    }
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
  return path.join(__dirname, 'preload.js')
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
