import { describe, expect, it, vi } from 'vitest'
import { AirtableRestClient } from './restClient.ts'
import type { AirtableRecord, ListRecordsResponse } from './types.ts'

function makeClient(): AirtableRestClient {
  return new AirtableRestClient({
    baseId: 'appTest',
    getAccessToken: () => 'test-token',
  })
}

function record(id: string): AirtableRecord {
  return { id, createdTime: '2026-01-01T00:00:00.000Z', fields: {} }
}

describe('listAllRecords pagesFetched', () => {
  it('reports 1 fetch when maxPages truncates after a single page', async () => {
    const client = makeClient()
    const listRecords = vi
      .spyOn(client, 'listRecords')
      .mockResolvedValue({
        records: [record('rec1')],
        offset: 'offset-2',
      } as ListRecordsResponse)

    const result = await client.listAllRecords('tblTest', { maxPages: 1 })

    expect(listRecords).toHaveBeenCalledTimes(1)
    expect(result.pagesFetched).toBe(1)
    expect(result.truncated).toBe(true)
  })

  it('reports 0 fetches when maxTotal is 0', async () => {
    const client = makeClient()
    const listRecords = vi.spyOn(client, 'listRecords')

    const result = await client.listAllRecords('tblTest', { maxTotal: 0 })

    expect(listRecords).not.toHaveBeenCalled()
    expect(result.pagesFetched).toBe(0)
    expect(result.truncated).toBe(true)
    expect(result.records).toEqual([])
  })

  it('counts each real fetch across a full multi-page pagination', async () => {
    const client = makeClient()
    const pages: ListRecordsResponse[] = [
      { records: [record('rec1')], offset: 'o1' },
      { records: [record('rec2')], offset: 'o2' },
      { records: [record('rec3')] },
    ]
    let call = 0
    vi.spyOn(client, 'listRecords').mockImplementation(async () => pages[call++]!)

    const result = await client.listAllRecords('tblTest', {})

    expect(call).toBe(3)
    expect(result.pagesFetched).toBe(3)
    expect(result.truncated).toBe(false)
    expect(result.records).toHaveLength(3)
  })
})
