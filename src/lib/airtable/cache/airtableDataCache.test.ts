import { describe, expect, it, beforeEach, vi } from 'vitest'
import { AirtableDataCache } from './airtableDataCache.ts'

describe('AirtableDataCache', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
      clear: () => store.clear(),
    })
  })

  it('stores and returns schema within TTL', () => {
    const cache = new AirtableDataCache('appTest')
    const schema = { tables: [] }
    cache.setSchema(schema as never)
    expect(cache.getSchema()).toEqual(schema)
  })

  it('merges linked labels across calls', () => {
    const cache = new AirtableDataCache('appTest')
    cache.mergeLinkedLabels('tblCity', ['Name'], new Map([['rec1', 'Denver']]))
    cache.mergeLinkedLabels('tblCity', ['Name'], new Map([['rec2', 'Boulder']]))
    expect(cache.getLinkedLabels('tblCity', ['Name'])).toEqual({
      rec1: 'Denver',
      rec2: 'Boulder',
    })
  })

  it('clears table-scoped keys', () => {
    const cache = new AirtableDataCache('appTest')
    cache.setList('tblB', {}, { records: [] })
    cache.mergeLinkedLabels('tblB', ['Name'], { rec1: 'X' })
    cache.clearTable('tblB')
    expect(cache.getList('tblB', {})).toBeUndefined()
    expect(cache.getLinkedLabels('tblB', ['Name'])).toEqual({})
  })

  it('peekEntryRaw returns payload for expired entries without evicting', () => {
    const cache = new AirtableDataCache('appPeek')
    cache.set('test:key', { ok: true }, -1000)
    expect(cache.peekEntryRaw('test:key')?.data).toEqual({ ok: true })
    expect(cache.get('test:key')).toBeUndefined()
    expect(cache.peekEntryRaw('test:key')).toBeUndefined()
  })
})
