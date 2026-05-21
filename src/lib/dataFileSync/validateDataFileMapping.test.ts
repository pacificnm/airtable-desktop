import { describe, expect, it } from 'vitest'
import { countryDataFileMapping } from '../../../module-repos/country/lib/countryDataFileMapping.ts'
import { countryModuleTables } from '../../../module-repos/country/tables.ts'
import { validateDataFileMapping } from './validateDataFileMapping.ts'

describe('validateDataFileMapping', () => {
  const countryTable = countryModuleTables.find((t) => t.key === 'country')!

  it('passes for a valid country mapping', () => {
    expect(
      validateDataFileMapping(countryDataFileMapping, countryTable),
    ).toEqual([])
  })

  it('reports missing table fields', () => {
    const issues = validateDataFileMapping(
      {
        ...countryDataFileMapping,
        fields: [
          {
            airtableField: 'notARealField',
            csvColumn: 'COUNTRY',
            type: 'string',
          },
        ],
      },
      countryTable,
    )
    expect(issues.some((i) => i.code === 'FIELD_NOT_ON_TABLE')).toBe(true)
  })
})
