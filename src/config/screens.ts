import type { ComponentType } from 'react'
import type { AppView, CoreAppView } from '../components/main/appView.ts'
import {
  getModuleScreenConfigs,
  getModuleScreenImporters,
} from '../lib/modules/registry.ts'

/** Static metadata for each app screen (labels, docs). */
export interface ScreenConfig {
  id: AppView
  /** Short title for chrome / headers */
  title: string
}

const coreScreens: readonly ScreenConfig[] = [
  { id: 'home', title: 'Home' },
  { id: 'devTables', title: 'Tables' },
  { id: 'devDocs', title: 'Documentation' },
  { id: 'devTokens', title: 'CSS tokens' },
  { id: 'devTheme', title: 'MUI theme' },
  { id: 'devModules', title: 'Modules' },
]

export const screens: readonly ScreenConfig[] = [
  ...coreScreens,
  ...getModuleScreenConfigs(),
]

export const screenConfigById: Record<string, ScreenConfig> = Object.fromEntries(
  screens.map((s) => [s.id, s]),
)

export function getScreenTitle(id: AppView): string {
  return screenConfigById[id]?.title ?? id
}

type ScreenModule = { default: ComponentType }

const coreScreenImporters: Record<CoreAppView, () => Promise<ScreenModule>> = {
  home: () => import('../screens/Home.tsx'),
  devTables: () => import('../screens/DeveloperTables.tsx'),
  devDocs: () => import('../screens/DeveloperDocs.tsx'),
  devTokens: () => import('../screens/DeveloperTokens.tsx'),
  devTheme: () => import('../screens/DeveloperTheme.tsx'),
  devModules: () => import('../screens/DeveloperModules.tsx'),
}

export const screenImporters: Record<string, () => Promise<ScreenModule>> = {
  ...coreScreenImporters,
  ...getModuleScreenImporters(),
}
