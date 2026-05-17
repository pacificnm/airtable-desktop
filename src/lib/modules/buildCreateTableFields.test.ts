import { describe, expect, it } from 'vitest'
import { buildCreateTableFields } from './buildCreateTableFields.ts'

describe('buildCreateTableFields multipleRecordLinks', () => {
  it('only sends linkedTableId in options (Airtable create-table API)', () => {
    const fields = buildCreateTableFields(
      [
        {
          name: 'Role',
          type: 'multipleRecordLinks',
          linkToTableKey: 'roles',
          options: { prefersSingleRecordLink: true },
        },
      ],
      { roles: 'tblRoles123' },
    )
    expect(fields[0]?.options).toEqual({ linkedTableId: 'tblRoles123' })
  })
})
