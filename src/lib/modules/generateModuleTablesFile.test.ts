import { describe, expect, it } from 'vitest'
import { sampleMetaTable } from '../airtable/__fixtures__/sampleMetaTable.ts'
import {
  generateModuleTablesFileContent,
  resolveMetaTableForConfig,
} from './generateModuleTablesFile.ts'

const sampleTableId = 'tblFakeLocations01'

describe('generateModuleTablesFile', () => {
  it('resolves table by id', () => {
    const meta = resolveMetaTableForConfig(
      {
        key: 'locations',
        label: 'Locations',
        tableId: sampleTableId,
        fields: { name: 'Name' },
      },
      [{ ...sampleMetaTable, id: sampleTableId }],
    )
    expect(meta?.id).toBe(sampleTableId)
  })

  it('generates tables.ts with camelCase field keys', () => {
    const meta = { ...sampleMetaTable, id: sampleTableId, name: 'Locations' }
    const content = generateModuleTablesFileContent(
      'location',
      [
        {
          key: 'locations',
          label: 'Locations',
          tableId: sampleTableId,
          tableName: 'Locations',
          fields: { name: 'Name' },
          screens: ['locationsList'],
        },
      ],
      [meta],
    )
    expect(content).toContain("from '@/config/tableTypes.ts'")
    expect(content).toContain('export const locationModuleTables')
    expect(content).toContain(`tableId: '${sampleTableId}'`)
    expect(content).toContain("screens: ['locationsList']")
    expect(content).not.toContain('createTable')
  })
})
