import { describe, expect, it } from 'vitest'
import type { AirtableTableConfig } from '../../config/tables.ts'
import {
  mapAirtableToConfigFields,
  mapConfigToAirtableFields,
  normalizeRecord,
} from './mapRecordFields.ts'

const tableConfig = {
  key: 'workItems',
  label: 'Work Items',
  tableId: 'tblSample',
  fields: {
    title: 'Title',
    status: 'Status',
    done: 'Done',
  },
} satisfies AirtableTableConfig

describe('mapConfigToAirtableFields', () => {
  it('maps config keys to Airtable field names and skips undefined', () => {
    expect(
      mapConfigToAirtableFields(tableConfig, {
        title: 'Fix bug',
        status: 'Open',
        done: undefined,
        unknownKey: 'ignored',
      }),
    ).toEqual({
      Title: 'Fix bug',
      Status: 'Open',
    })
  })
})

describe('mapAirtableToConfigFields', () => {
  it('maps Airtable field names to config keys', () => {
    expect(
      mapAirtableToConfigFields<Record<string, unknown>>(tableConfig, {
        Title: 'Fix bug',
        Status: 'Open',
        'Extra column': 'ignored',
      }),
    ).toEqual({
      title: 'Fix bug',
      status: 'Open',
    })
  })
})

describe('normalizeRecord', () => {
  it('normalizes id, createdTime, and fields', () => {
    expect(
      normalizeRecord(tableConfig, {
        id: 'recABC',
        createdTime: '2026-01-01T00:00:00.000Z',
        fields: { Title: 'Hello', Done: true },
      }),
    ).toEqual({
      id: 'recABC',
      createdTime: '2026-01-01T00:00:00.000Z',
      fields: { title: 'Hello', done: true },
    })
  })
})
