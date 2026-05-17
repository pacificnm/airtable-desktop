import { describe, expect, it } from 'vitest'
import { roleFormValuesToAirtableFields, validateRoleFormValues } from './roleForm.ts'
import { getRolesTableConfig } from '../validation/roles.ts'

const config = getRolesTableConfig()!

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
