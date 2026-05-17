import { describe, expect, it } from 'vitest'
import {
  getDiscoveredModules,
  getEnabledModuleDefinitions,
  getModuleTableContributions,
} from '../lib/modules/registry.ts'
import { getEffectiveEnabledModuleIds } from '../lib/modules/modulePreferences.ts'
import { getTableConfig } from './tables.ts'

describe('tables init', () => {
  it('registers module tables', () => {
    expect(getEffectiveEnabledModuleIds()).toEqual(
      expect.arrayContaining(['config', 'roles', 'users']),
    )
    expect(getDiscoveredModules().map((m) => m.definition.id)).toEqual(
      expect.arrayContaining(['config', 'roles', 'users']),
    )
    expect(getEnabledModuleDefinitions().length).toBeGreaterThanOrEqual(3)
    expect(getModuleTableContributions().map((t) => t.key)).toEqual(
      expect.arrayContaining(['appConfig', 'roles', 'rolePermissions', 'appUsers']),
    )
    expect(getTableConfig('appConfig')?.key).toBe('appConfig')
    expect(getTableConfig('roles')?.key).toBe('roles')
    expect(getTableConfig('appUsers')?.key).toBe('appUsers')
  })
})
