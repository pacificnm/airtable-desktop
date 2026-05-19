import { describe, expect, it } from 'vitest'
import {
  getDiscoveredModules,
  getEnabledModuleDefinitions,
  getModuleTableContributions,
} from '../lib/modules/registry.ts'
import { getEffectiveEnabledModuleIds } from '../lib/modules/modulePreferences.ts'
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
