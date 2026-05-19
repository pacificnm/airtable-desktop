import { describe, expect, it } from 'vitest'
import type { AirtableTableConfig } from '../../../src/config/tableTypes.ts'
import {
  rolePermissionFormValuesToAirtableFields,
  validateRolePermissionFormValues,
} from './permissionForm.ts'
import { rolesModuleTables } from '../tables.ts'
import { ROLE_PERMISSIONS_TABLE_KEY } from '../validation/roles.ts'

const config = rolesModuleTables.find(
  (t) => t.key === ROLE_PERMISSIONS_TABLE_KEY,
) as AirtableTableConfig

describe('rolePermissionFormValuesToAirtableFields', () => {
  it('maps role link as record ids', () => {
    expect(
      rolePermissionFormValuesToAirtableFields(config, {
        label: 'Users read',
        roleId: 'recROLE',
        resource: 'users',
        action: 'read',
        allowed: true,
      }),
    ).toEqual({
      Label: 'Users read',
      Role: ['recROLE'],
      Resource: 'users',
      Action: 'read',
      Allowed: true,
    })
  })
})

describe('validateRolePermissionFormValues', () => {
  it('requires role', () => {
    expect(
      validateRolePermissionFormValues({
        label: 'x',
        roleId: '',
        resource: 'users',
        action: 'read',
        allowed: true,
      }),
    ).toBe('Role is required.')
  })
})
