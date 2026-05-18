import { describe, expect, it } from 'vitest'
import {
  collectRecordIdsForDisplayMeta,
  displayFieldMetaForConfigKey,
  displayFieldOverridesForTable,
  rawDisplayValuesForMeta,
} from './displayFieldsFromSchema.ts'
import type { MetaTableSchema } from './metaTypes.ts'

const buildingTable: MetaTableSchema = {
  id: 'tblBuilding',
  name: 'Building',
  primaryFieldId: 'fldPreferred',
  views: [],
  fields: [
    { id: 'fldPreferred', name: 'Preferred Name', type: 'singleLineText' },
    {
      id: 'fldCityLink',
      name: 'City',
      type: 'multipleRecordLinks',
      options: { linkedTableId: 'tblCity' },
    },
    {
      id: 'fldCityLookup',
      name: 'City Name',
      type: 'lookup',
      options: { recordLinkFieldId: 'fldCityLink' },
    },
    {
      id: 'fldRegionLink',
      name: 'Regions',
      type: 'multipleRecordLinks',
      options: { linkedTableId: 'tblRegion' },
    },
    {
      id: 'fldRegionLookup',
      name: 'Region',
      type: 'lookup',
      options: {
        recordLinkFieldId: 'fldRegionLink',
        fieldIdInLinkedTable: 'fldRegionName',
      },
    },
  ],
}

describe('displayFieldOverridesForTable', () => {
  it('maps link config keys to lookup field names', () => {
    const overrides = displayFieldOverridesForTable(buildingTable, ['city'])
    expect(overrides.city).toBe('City Name')
  })

  it('maps region to Region lookup when link is named Regions', () => {
    const overrides = displayFieldOverridesForTable(buildingTable, ['region'])
    expect(overrides.region).toBe('Region')
  })
})

describe('displayFieldMetaForConfigKey', () => {
  it('finds backing link when tables.ts maps region to lookup field Region', () => {
    const meta = displayFieldMetaForConfigKey(buildingTable, 'region', 'Region')
    expect(meta?.linkField.name).toBe('Regions')
    expect(meta?.lookupFields.map((f) => f.name)).toContain('Region')
  })

  it('collects ids from link column when lookup is empty', () => {
    const meta = displayFieldMetaForConfigKey(buildingTable, 'region', 'Region')
    expect(meta).toBeDefined()
    const ids = collectRecordIdsForDisplayMeta(
      {
        Regions: ['recREGION1'],
        Region: [],
      },
      meta!,
      'Region',
    )
    expect(ids).toEqual(['recREGION1'])
  })

  it('reads lookup values from raw fields', () => {
    const meta = displayFieldMetaForConfigKey(buildingTable, 'region', 'Region')
    const values = rawDisplayValuesForMeta(
      { Regions: ['recX'], Region: ['West'] },
      meta!,
      'Region',
    )
    expect(values).toContainEqual(['West'])
    expect(values).toContainEqual(['recX'])
  })
})
