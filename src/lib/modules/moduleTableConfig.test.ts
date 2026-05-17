import { describe, expect, it } from 'vitest'
import {
  moduleTableConfigKey,
  parseModuleTableConfigKey,
} from './moduleTableConfig.ts'

describe('moduleTableConfigKey', () => {
  it('builds stable keys', () => {
    expect(moduleTableConfigKey('roles', 'roles')).toBe('module.roles.table.roles')
  })
})

describe('parseModuleTableConfigKey', () => {
  it('parses module table keys', () => {
    expect(parseModuleTableConfigKey('module.users.table.appUsers')).toEqual({
      moduleId: 'users',
      tableKey: 'appUsers',
    })
  })

  it('rejects other keys', () => {
    expect(parseModuleTableConfigKey('module.users.enabled')).toBeNull()
  })
})
