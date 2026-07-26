import { describe, expect, it } from 'vitest'
import { buildCreateTableFields, sortBlueprintsForProvisioning } from './buildCreateTableFields.ts'

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

describe('sortBlueprintsForProvisioning', () => {
  it('sorts a long linear dependency chain without dropping tables', () => {
    const tableCount = 10
    // table0 has no deps, table1 depends on table0, table2 on table1, etc.
    // Reverse the input order so the sort has to do real work.
    const blueprints = Array.from({ length: tableCount }, (_, i) => ({
      tableKey: `table${i}`,
      fields: i === 0 ? [] : [{ name: 'Link', type: 'multipleRecordLinks', linkToTableKey: `table${i - 1}` }],
    })).reverse()

    const sorted = sortBlueprintsForProvisioning(blueprints)

    expect(sorted).toHaveLength(tableCount)
    const order = sorted.map((b) => b.tableKey)
    for (let i = 1; i < tableCount; i++) {
      expect(order.indexOf(`table${i - 1}`)).toBeLessThan(order.indexOf(`table${i}`))
    }
  })
})
