import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearModuleOverrideIds,
  disableModule,
  enableModule,
  getEffectiveEnabledModuleIds,
  hasModuleOverride,
  readModuleOverrideIds,
  writeModuleOverrideIds,
} from './modulePreferences.ts'

function mockStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
    removeItem: (key: string) => {
      data.delete(key)
    },
    clear: () => data.clear(),
  }
}

describe('modulePreferences', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', mockStorage())
  })

  afterEach(() => {
    clearModuleOverrideIds()
    vi.unstubAllGlobals()
  })

  it('uses override when set', () => {
    writeModuleOverrideIds(['config'])
    expect(getEffectiveEnabledModuleIds()).toEqual(['config'])
    expect(hasModuleOverride()).toBe(true)
  })

  it('enableModule adds to override list', () => {
    enableModule('roles')
    enableModule('config')
    expect(readModuleOverrideIds()).toEqual(expect.arrayContaining(['roles', 'config']))
  })

  it('disableModule removes id', () => {
    writeModuleOverrideIds(['config', 'roles'])
    disableModule('roles')
    expect(readModuleOverrideIds()).toEqual(['config'])
  })

  it('empty override falls back to built-in enabled list', () => {
    writeModuleOverrideIds([])
    expect(getEffectiveEnabledModuleIds().length).toBeGreaterThan(0)
  })
})
