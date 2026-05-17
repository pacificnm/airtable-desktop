import { describe, expect, it } from 'vitest'
import { discoverModules } from './discover.ts'
import {
  findDiscoveredModule,
  getModuleMenuSections,
  getModuleScreenContributions,
  getModuleTableContributions,
  isModuleEnabled,
} from './registry.ts'

describe('module discovery', () => {
  it('discovers bundled modules', () => {
    const ids = discoverModules().map((m) => m.definition.id)
    expect(ids).toContain('roles')
    expect(ids).toContain('config')
    expect(ids).toContain('notifications')
  })
})

describe('module registry (disabled by default)', () => {
  it('does not merge roles tables when disabled', () => {
    if (isModuleEnabled('roles')) return
    const keys = getModuleTableContributions().map((t) => t.key)
    expect(keys).not.toContain('roles')
  })

  it('finds roles manifest metadata', () => {
    const mod = findDiscoveredModule('roles')
    expect(mod?.definition.name).toMatch(/Roles/i)
    expect(mod?.definition.screens?.length).toBeGreaterThanOrEqual(2)
  })
})

describe('module registry (when roles enabled)', () => {
  it('merges tables, screens, and menu when roles is enabled', () => {
    if (!isModuleEnabled('roles')) return

    const tableKeys = getModuleTableContributions().map((t) => t.key)
    expect(tableKeys).toContain('roles')
    expect(tableKeys).toContain('rolePermissions')

    const screenIds = getModuleScreenContributions().map((s) => s.id)
    expect(screenIds).toContain('rolesList')

    const menu = getModuleMenuSections()
    expect(menu.some((s) => s.label === 'Access control')).toBe(true)
  })
})
