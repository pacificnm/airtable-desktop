import { describe, expect, it } from 'vitest'
import {
  customModuleDir,
  defaultModuleDir,
  discoverModules,
  moduleDiscoveryDirs,
} from './discover.ts'

describe('module discovery locations', () => {
  it('searches default and custom module directories', () => {
    expect(moduleDiscoveryDirs).toEqual([defaultModuleDir, customModuleDir])
  })

  it('discovers bundled default modules', () => {
    const ids = discoverModules().map((m) => m.definition.id)
    expect(ids).toContain('config')
    expect(ids).toContain('roles')
  })

  it('labels default modules under modules/', () => {
    const roles = discoverModules().find((m) => m.definition.id === 'roles')
    expect(roles?.rootPath).toBe('modules/roles')
  })

  it('discovers custom module-repos/location', () => {
    const location = discoverModules().find((m) => m.definition.id === 'location')
    expect(location?.rootPath).toBe('module-repos/location')
    expect(location?.definition.name).toMatch(/Locations/i)
  })
})
