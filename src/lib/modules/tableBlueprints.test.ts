import { describe, expect, it } from 'vitest'
import { sortBlueprintsForProvisioning } from './buildCreateTableFields.ts'
import { isPlaceholderTableId } from './tableBlueprints.ts'

describe('isPlaceholderTableId', () => {
  it('detects REPLACE placeholders', () => {
    expect(isPlaceholderTableId('tblREPLACE_APP_CONFIG')).toBe(true)
  })

  it('accepts real table ids', () => {
    expect(isPlaceholderTableId('tbl8Xbuy9pdK5ClVO')).toBe(false)
  })
})

describe('sortBlueprintsForProvisioning', () => {
  it('orders link targets before dependents', () => {
    const sorted = sortBlueprintsForProvisioning([
      {
        tableKey: 'rolePermissions',
        fields: [{ name: 'Role', type: 'multipleRecordLinks', linkToTableKey: 'roles' }],
      },
      { tableKey: 'roles', fields: [{ name: 'Name', type: 'singleLineText' }] },
    ] as const)
    expect((sorted[0] as { tableKey: string }).tableKey).toBe('roles')
  })
})
