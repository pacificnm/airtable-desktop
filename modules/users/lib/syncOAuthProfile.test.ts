import { describe, expect, it, vi } from 'vitest'
import type { AirtableClient } from '../../../src/lib/airtable/airtableClient.ts'
import type { AirtableTableConfig } from '../../../src/config/tables.ts'
import type { WhoamiResponse } from '../../../src/lib/airtable/types.ts'
import { syncOAuthUserProfile } from './syncOAuthProfile.ts'

const tableConfig: AirtableTableConfig = {
  key: 'appUsers',
  label: 'App Users',
  tableId: 'tblAppUsers',
  fields: {
    email: 'Email',
    displayName: 'Display name',
    airtableUserId: 'Airtable user id',
    active: 'Active',
  },
}

const whoami: WhoamiResponse = { id: 'usr123', email: 'jane@example.com' }

function makeClient(overrides: Partial<AirtableClient> = {}): AirtableClient {
  return {
    baseId: 'appTest',
    listRecords: vi.fn(),
    getRecord: vi.fn(),
    retrieveRecord: vi.fn(),
    listAllRecords: vi.fn(),
    getBaseSchema: vi.fn(),
    findTableById: vi.fn(),
    createRecords: vi.fn(),
    updateRecords: vi.fn(),
    deleteRecords: vi.fn(),
    createTable: vi.fn(),
    whoami: vi.fn(),
    uploadRecordAttachment: vi.fn(),
    ...overrides,
  } as unknown as AirtableClient
}

describe('syncOAuthUserProfile', () => {
  it('creates a new record with active:true and a derived displayName', async () => {
    const client = makeClient({
      listRecords: vi.fn().mockResolvedValue({ records: [] }),
      createRecords: vi.fn().mockResolvedValue({ records: [{ id: 'recNew' }] }),
    })

    const result = await syncOAuthUserProfile(client, tableConfig, whoami)

    expect(result).toEqual({ recordId: 'recNew', created: true })
    expect(client.createRecords).toHaveBeenCalledWith('tblAppUsers', [
      {
        fields: {
          Email: 'jane@example.com',
          'Display name': 'jane',
          'Airtable user id': 'usr123',
          Active: true,
        },
      },
    ])
  })

  it('does not overwrite active or displayName on an existing record', async () => {
    const client = makeClient({
      listRecords: vi.fn().mockResolvedValue({
        records: [
          {
            id: 'recExisting',
            fields: {
              Email: 'jane@example.com',
              'Display name': 'Jane Admin-Renamed',
              'Airtable user id': 'usr123',
              Active: false,
            },
          },
        ],
      }),
      updateRecords: vi.fn().mockResolvedValue({ records: [] }),
    })

    const result = await syncOAuthUserProfile(client, tableConfig, whoami)

    expect(result).toEqual({ recordId: 'recExisting', created: false })
    const [, records] = (client.updateRecords as ReturnType<typeof vi.fn>).mock.calls[0]!
    expect(records).toEqual([
      {
        id: 'recExisting',
        fields: {
          Email: 'jane@example.com',
          'Airtable user id': 'usr123',
        },
      },
    ])
    const fields = records[0].fields as Record<string, unknown>
    expect(fields).not.toHaveProperty('Active')
    expect(fields).not.toHaveProperty('Display name')
  })
})
