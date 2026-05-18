import { describe, expect, it } from 'vitest'
import {
  generateModuleFieldsMetaFileContent,
  generateModuleTablesFileContent,
} from './generateModuleTablesFile.ts'
import type { AirtableTableConfig } from '../../config/tableTypes.ts'
import type { MetaTableSchema } from '../airtable/metaTypes.ts'

const tableConfig = {
  key: 'building',
  label: 'Building',
  tableId: 'tblBuilding',
  fields: { status: 'Status' },
} satisfies AirtableTableConfig

const meta: MetaTableSchema = {
  id: 'tblBuilding',
  name: 'Building',
  primaryFieldId: 'fldName',
  views: [],
  fields: [
    { id: 'fldName', name: 'Preferred Name', type: 'singleLineText' },
    {
      id: 'fldStatus',
      name: 'Status',
      type: 'singleSelect',
      options: {
        choices: [{ id: 'sel1', name: 'Open', color: 'greenBright' }],
      },
    },
  ],
}

describe('generateModuleFieldsMetaFileContent', () => {
  it('embeds select choice colors in tables.meta.ts', () => {
    const source = generateModuleFieldsMetaFileContent('location', [tableConfig], [meta])
    expect(source).toContain('locationModuleFieldsMeta')
    expect(source).toContain('greenBright')
    expect(source).toContain("configKey: 'status'")
  })
})

describe('generateModuleTablesFileContent', () => {
  it('references tables.meta.ts in header comment', () => {
    const source = generateModuleTablesFileContent('location', [tableConfig], [meta])
    expect(source).toContain('tables.meta.ts')
  })
})
