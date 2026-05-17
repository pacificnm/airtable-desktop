import { describe, expect, it } from 'vitest'
import {
  buildAppDrawerSections,
  buildElectronMenuContributions,
  expandModuleMenuItems,
  getCoreMenuItems,
} from './buildMenu.ts'
import type { AppModuleDefinition } from '../modules/types.ts'

describe('buildMenu', () => {
  it('puts core dev screens in electron menus only', () => {
    const electron = buildElectronMenuContributions(getCoreMenuItems())
    const drawer = buildAppDrawerSections(getCoreMenuItems())

    expect(electron.some((e) => e.viewId === 'devTables')).toBe(true)
    expect(electron.some((e) => e.viewId === 'devTokens')).toBe(true)
    expect(drawer.flatMap((s) => s.items).some((i) => i.id === 'core:tables')).toBe(false)
    expect(drawer.some((s) => s.id === 'core:main')).toBe(true)
  })

  it('maps legacy menuSections to app drawer only', () => {
    const def = {
      id: 'roles',
      name: 'Roles',
      version: '0.0.0',
      menuSections: [
        {
          id: 'access',
          label: 'Access control',
          items: [
            {
              id: 'roles',
              label: 'Roles',
              icon: 'adminPanelSettings' as const,
              viewId: 'rolesList',
            },
          ],
        },
      ],
    } satisfies AppModuleDefinition

    const items = expandModuleMenuItems('roles', def)
    const drawer = buildAppDrawerSections(items)
    const electron = buildElectronMenuContributions(items)

    expect(drawer.some((s) => s.id === 'roles:access')).toBe(true)
    expect(electron).toHaveLength(0)
  })

  it('honors explicit placements on menuItems', () => {
    const def = {
      id: 'demo',
      name: 'Demo',
      version: '0.0.0',
      menuItems: [
        {
          id: 'screen',
          label: 'Demo screen',
          icon: 'gridView' as const,
          viewId: 'demoScreen',
          placements: [
            { surface: 'appDrawer', section: { id: 'demo', label: 'Demo' } },
            { surface: 'electron', menu: 'developer', order: 5 },
          ],
        },
      ],
    } satisfies AppModuleDefinition

    const items = expandModuleMenuItems('demo', def)
    expect(buildAppDrawerSections(items)).toHaveLength(1)
    expect(buildElectronMenuContributions(items)).toHaveLength(1)
  })
})
