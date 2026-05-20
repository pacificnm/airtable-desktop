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

  it('merges menuNav global groups across modules', () => {
    const makeDef = (id: string, itemId: string, viewId: string) =>
      ({
        id,
        name: id,
        version: '0.0.0',
        menuNav: {
          groups: [
            { id: 'reference', label: 'Reference data', scope: 'global', order: 50 },
          ],
        },
        menuItems: [
          {
            id: itemId,
            label: itemId,
            icon: 'gridView' as const,
            viewId: viewId as 'home',
            menuGroupId: 'reference',
          },
        ],
      }) satisfies AppModuleDefinition

    const items = [
      ...expandModuleMenuItems('city', makeDef('city', 'city-list', 'cityList')),
      ...expandModuleMenuItems('state', makeDef('state', 'state-list', 'stateList')),
    ]
    const drawer = buildAppDrawerSections(items)

    expect(drawer).toHaveLength(1)
    expect(drawer[0]?.id).toBe('global:reference')
    expect(drawer[0]?.items).toHaveLength(2)
  })

  it('keeps module-scoped sections separate by default', () => {
    const def = {
      id: 'alpha',
      name: 'Alpha',
      version: '0.0.0',
      menuItems: [
        {
          id: 'one',
          label: 'One',
          icon: 'gridView' as const,
          viewId: 'home',
          placements: [
            { surface: 'appDrawer', section: { id: 'tools', label: 'Tools' } },
          ],
        },
      ],
    } satisfies AppModuleDefinition

    const items = expandModuleMenuItems('alpha', def)
    expect(buildAppDrawerSections(items)[0]?.id).toBe('alpha:tools')
  })
})
