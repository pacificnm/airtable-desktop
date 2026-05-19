import { describe, expect, it } from 'vitest'
import type { AirtableTableConfig } from '../../../src/config/tableTypes.ts'
import { roleFormValuesToAirtableFields, validateRoleFormValues } from './roleForm.ts'
import { rolesModuleTables } from '../tables.ts'
import { ROLES_TABLE_KEY } from '../validation/roles.ts'

const config = rolesModuleTables.find(
  (t) => t.key === ROLES_TABLE_KEY,
) as AirtableTableConfig

describe('roleFormValuesToAirtableFields', () => {
  it('maps to Airtable field names', () => {
    expect(
      roleFormValuesToAirtableFields(config, {
        name: 'Editor',
        description: 'Can edit',
        active: true,
      }),
    ).toEqual({
      Name: 'Editor',
      Description: 'Can edit',
      Active: true,
    })
  })
})

describe('validateRoleFormValues', () => {
  it('requires name', () => {
    expect(
      validateRoleFormValues({ name: '  ', description: '', active: true }),
    ).toBe('Name is required.')
  })
})
