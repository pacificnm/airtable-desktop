import {
  app,
  BrowserWindow,
  dialog,
  Menu,
  type MenuItemConstructorOptions,
  type MessageBoxOptions,
} from 'electron'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { navigateMenuAction, type AppMenuAction } from './appMenuActions.js'
import type { ElectronMenuContribution } from './menuTypes.js'

function focusedWindow(): BrowserWindow | null {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0] ?? null
}

function sendMenuAction(action: AppMenuAction): void {
  const win = focusedWindow()
  if (win && !win.isDestroyed()) {
    win.webContents.send('app:menu-action', action)
  }
}

function navigate(view: string): () => void {
  return () => sendMenuAction(navigateMenuAction(view))
}

function readPackageMeta(): {
  name: string
  version: string
  description?: string
  homepage?: string
} {
  try {
    const raw = readFileSync(join(app.getAppPath(), 'package.json'), 'utf8')
    const pkg = JSON.parse(raw) as {
      appName?: string
      name?: string
      version?: string
      description?: string
      homepage?: string
    }
    return {
      name:
        typeof pkg.appName === 'string' && pkg.appName.length > 0
          ? pkg.appName
          : (pkg.name ?? 'Airtable Desktop'),
      version: pkg.version ?? '0.0.0',
      description: pkg.description,
      homepage: pkg.homepage,
    }
  } catch {
    return { name: app.getName(), version: app.getVersion() }
  }
}

export function showAboutDialog(parent?: BrowserWindow | null): void {
  const meta = readPackageMeta()
  const detailLines = [
    `Version ${meta.version}`,
    meta.description,
    meta.homepage,
  ].filter((line): line is string => Boolean(line && line.trim()))

  const options: MessageBoxOptions = {
    type: 'info',
    title: `About ${meta.name}`,
    message: meta.name,
    detail: detailLines.join('\n\n'),
    buttons: ['OK'],
    defaultId: 0,
    noLink: true,
  }

  if (parent && !parent.isDestroyed()) {
    void dialog.showMessageBox(parent, options)
  } else {
    void dialog.showMessageBox(options)
  }
}

export type ApplicationMenuOptions = {
  debugEnabled?: boolean
  electronMenuItems?: readonly ElectronMenuContribution[]
}

function contributionToMenuItem(
  entry: ElectronMenuContribution,
): MenuItemConstructorOptions {
  return {
    label: entry.label,
    click: navigate(entry.viewId),
  }
}

function groupElectronContributions(
  items: readonly ElectronMenuContribution[],
  menu: ElectronMenuContribution['menu'],
): MenuItemConstructorOptions[] {
  return items
    .filter((item) => item.menu === menu)
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
    .map(contributionToMenuItem)
}

let cachedOptions: ApplicationMenuOptions = { debugEnabled: false, electronMenuItems: [] }

export function buildApplicationMenu(
  options: ApplicationMenuOptions = {},
): Menu {
  cachedOptions = {
    debugEnabled: options.debugEnabled ?? cachedOptions.debugEnabled ?? false,
    electronMenuItems: options.electronMenuItems ?? cachedOptions.electronMenuItems ?? [],
  }

  const isMac = process.platform === 'darwin'
  const debugEnabled = cachedOptions.debugEnabled ?? false
  const electronItems = cachedOptions.electronMenuItems ?? []

  const viewNavItems = groupElectronContributions(electronItems, 'view')
  const developerNavItems = groupElectronContributions(electronItems, 'developer')

  const viewSubmenu: MenuItemConstructorOptions[] = [
    { role: 'reload', label: 'Reload' },
    { role: 'forceReload', visible: false },
    ...(debugEnabled
      ? [
          {
            role: 'toggleDevTools' as const,
            label: 'Toggle Developer Tools',
          },
          { type: 'separator' as const },
          {
            label: 'Open Debug Panel',
            accelerator: 'CmdOrCtrl+Shift+D',
            click: () => sendMenuAction('openDebugPanel'),
          },
        ]
      : []),
    ...(viewNavItems.length > 0
      ? [{ type: 'separator' as const }, ...viewNavItems]
      : []),
    { type: 'separator' },
    { role: 'resetZoom' },
    { role: 'zoomIn' },
    { role: 'zoomOut' },
    { type: 'separator' },
    { role: 'togglefullscreen' },
  ]

  const template: MenuItemConstructorOptions[] = []

  if (isMac) {
    template.push({
      label: app.name,
      submenu: [
        {
          label: `About ${app.name}`,
          click: () => showAboutDialog(focusedWindow()),
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    })
  } else {
    template.push({
      label: 'File',
      submenu: [{ role: 'quit' }],
    })
  }

  template.push({ label: 'View', submenu: viewSubmenu })

  if (developerNavItems.length > 0) {
    template.push({ label: 'Developer', submenu: developerNavItems })
  }

  if (!isMac) {
    template.push({
      label: 'Help',
      submenu: [
        {
          label: `About ${app.name}`,
          click: () => showAboutDialog(focusedWindow()),
        },
      ],
    })
  }

  if (isMac) {
    template.push({ role: 'windowMenu' })
  }

  return Menu.buildFromTemplate(template)
}

export function setApplicationMenu(options: ApplicationMenuOptions = {}): void {
  Menu.setApplicationMenu(buildApplicationMenu(options))
}

export function syncElectronMenuContributions(
  items: readonly ElectronMenuContribution[],
): void {
  setApplicationMenu({ electronMenuItems: items })
}
