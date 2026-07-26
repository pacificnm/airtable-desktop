import { afterEach, describe, expect, it } from 'vitest'
import {
  getDiscoveredModules,
  getEnabledModuleDefinitions,
  getModuleTableContributions,
} from '../lib/modules/registry.ts'
import { getEffectiveEnabledModuleIds } from '../lib/modules/modulePreferences.ts'
import {
  clearModuleTableIdCache,
  mergeModuleTableIdCache,
} from '../lib/modules/moduleTableIdCache.ts'
import { enabledModuleIds as builtInEnabledModuleIds } from './enabledModules.ts'
import { getTableConfig } from './tables.ts'

describe('tables init', () => {
  it('registers tables for every default-enabled module', () => {
    const effective = getEffectiveEnabledModuleIds()
    for (const id of builtInEnabledModuleIds) {
      expect(effective).toContain(id)
    }

    const discoveredIds = getDiscoveredModules().map((m) => m.definition.id)
    for (const id of builtInEnabledModuleIds) {
      expect(discoveredIds).toContain(id)
    }

    expect(getEnabledModuleDefinitions().length).toBeGreaterThanOrEqual(
      builtInEnabledModuleIds.length,
    )

    const enabledTableKeys = getEnabledModuleDefinitions()
      .flatMap((m) => m.tables ?? [])
      .map((t) => t.key)
    const contributedKeys = getModuleTableContributions().map((t) => t.key)
    for (const key of enabledTableKeys) {
      expect(contributedKeys).toContain(key)
      expect(getTableConfig(key)?.key).toBe(key)
    }
  })
})

describe('getTableConfig id hydration', () => {
  afterEach(() => {
    clearModuleTableIdCache()
  })

  it('picks up a table id merged into the cache after this module already loaded', () => {
    const [firstKey] = getModuleTableContributions().map((t) => t.key)
    if (!firstKey) throw new Error('expected at least one contributed table for this test')

    expect(getTableConfig(firstKey)?.tableId).not.toBe('tblHydratedFromAppConfig')

    mergeModuleTableIdCache({ [firstKey]: 'tblHydratedFromAppConfig' })

    expect(getTableConfig(firstKey)?.tableId).toBe('tblHydratedFromAppConfig')
  })
})
