import { describe, expect, it } from 'vitest'
import type { AirtableTableConfig } from '@/config/tables.ts'
import type { MetaTableSchema } from '@/lib/airtable/metaTypes.ts'
import type { DataFileMapping } from './types.ts'
import { planConfigFieldsToAirtableWritePayload } from './linkedRecordWrite.ts'

const stateTable: MetaTableSchema = {
  id: 'tblState',
  name: 'State',
  primaryFieldId: 'fldName',
  views: [],
  fields: [
    { id: 'fldName', name: 'Name', type: 'singleLineText' },
    {
      id: 'fldCountryLink',
      name: 'Countries',
      type: 'multipleRecordLinks',
      options: { linkedTableId: 'tblCountry' },
    },
    {
      id: 'fldCountryLookup',
      name: 'Country',
      type: 'lookup',
      options: { recordLinkFieldId: 'fldCountryLink' },
    },
    {
      id: 'fldCityLink',
      name: 'Cities',
      type: 'multipleRecordLinks',
      options: { linkedTableId: 'tblCity' },
    },
    {
      id: 'fldCityLookup',
      name: 'City',
      type: 'lookup',
      options: { recordLinkFieldId: 'fldCityLink' },
    },
  ],
}

const tableConfig = {
  key: 'state',
  label: 'State',
  tableId: 'tblState',
  tableName: 'State',
  primaryField: 'name',
  fields: {
    name: 'Name',
    country: 'Country',
    city: 'City',
  },
  columns: [],
  list: { pageSize: 50 },
  screens: ['stateList'],
} as const satisfies AirtableTableConfig

const mapping: DataFileMapping = {
  id: 'test',
  label: 'test',
  tableKey: 'state',
  upsertKey: { airtableField: 'name', csvColumn: 'STATE' },
  required: [],
  fields: [
    { airtableField: 'name', csvColumn: 'STATE', type: 'string' },
    {
      airtableField: 'country',
      csvColumn: 'COUNTRY',
      type: 'linkedRecord',
      link: {
        tableKey: 'country',
        matchField: 'country',
        linkFieldId: 'fldCountryLink',
      },
    },
    { airtableField: 'city', csvColumn: 'CITY', type: 'string' },
  ],
}

describe('planConfigFieldsToAirtableWritePayload', () => {
  it('writes linked ids to the backing link column when config maps to a lookup', () => {
    const payload = planConfigFieldsToAirtableWritePayload(
      tableConfig,
      mapping,
      {
        name: 'Oregon',
        country: ['recCOUNTRY'],
      },
      stateTable,
      { country: 'tblCountry' },
    )

    expect(payload).toEqual({
      Name: 'Oregon',
      Countries: ['recCOUNTRY'],
    })
    expect(payload).not.toHaveProperty('Country')
  })

  it('does not fall back to writing rec ids onto the lookup column name', () => {
    const mappingNoFieldId: DataFileMapping = {
      ...mapping,
      fields: mapping.fields.map((field) =>
        field.airtableField === 'country'
          ? {
              ...field,
              link: { tableKey: 'country', matchField: 'country' },
            }
          : field,
      ),
    }

    const payload = planConfigFieldsToAirtableWritePayload(
      tableConfig,
      mappingNoFieldId,
      { name: 'Oregon', country: ['recCOUNTRY'] },
      stateTable,
      { country: 'tblCountry' },
    )

    expect(payload.Countries).toEqual(['recCOUNTRY'])
    expect(payload).not.toHaveProperty('Country')
  })

  it('drops scalar values targeted at link columns in schema', () => {
    const payload = planConfigFieldsToAirtableWritePayload(
      tableConfig,
      {
        ...mapping,
        fields: [
          { airtableField: 'name', csvColumn: 'STATE', type: 'string' },
          {
            airtableField: 'city',
            csvColumn: 'CITY',
            type: 'string',
          },
        ],
      },
      { city: 'Mar Del Plata' },
      stateTable,
    )

    expect(payload).toEqual({})
  })

  it('throws when schema is missing instead of writing invalid Country payloads', () => {
    expect(() =>
      planConfigFieldsToAirtableWritePayload(
        tableConfig,
        mapping,
        { country: ['recCOUNTRY'] },
        undefined,
      ),
    ).toThrow(/without base schema/i)
  })
})
