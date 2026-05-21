import type { MenuIconId, MenuPlacement } from './menuTypes.ts'

export interface CoreMenuItemContribution {
  id: string
  label: string
  viewId: string
  icon: MenuIconId
  order?: number
  placements: readonly MenuPlacement[]
}

/** Built-in routes (home, developer tools). Not tied to a `modules/` folder. */
export const coreMenuItems = [
  {
    id: 'home',
    label: 'Home',
    viewId: 'home',
    icon: 'home',
    order: 0,
    placements: [{ surface: 'appDrawer', section: { id: 'main', label: '' } }],
  },
  {
    id: 'css-tokens',
    label: 'CSS tokens',
    viewId: 'devTokens',
    icon: 'style',
    order: 10,
    placements: [{ surface: 'electron', menu: 'view', order: 10 }],
  },
  {
    id: 'mui-theme',
    label: 'MUI theme',
    viewId: 'devTheme',
    icon: 'palette',
    order: 20,
    placements: [{ surface: 'electron', menu: 'view', order: 20 }],
  },
  {
    id: 'tables',
    label: 'Tables',
    viewId: 'devTables',
    icon: 'tableChart',
    order: 10,
    placements: [{ surface: 'electron', menu: 'developer', order: 10 }],
  },
  {
    id: 'modules',
    label: 'Modules',
    viewId: 'devModules',
    icon: 'extension',
    order: 20,
    placements: [{ surface: 'electron', menu: 'developer', order: 20 }],
  },
  {
    id: 'base-tables',
    label: 'Base tables',
    viewId: 'devBaseTables',
    icon: 'tableChart',
    order: 15,
    placements: [{ surface: 'electron', menu: 'developer', order: 15 }],
  },
  {
    id: 'data-file-mappings',
    label: 'Data file mappings',
    viewId: 'devDataFileMappings',
    icon: 'tableChart',
    order: 25,
    placements: [{ surface: 'electron', menu: 'developer', order: 25 }],
  },
  {
    id: 'docs',
    label: 'Documentation',
    viewId: 'devDocs',
    icon: 'menuBook',
    order: 30,
    placements: [{ surface: 'electron', menu: 'developer', order: 30 }],
  },
] as const satisfies readonly CoreMenuItemContribution[]
