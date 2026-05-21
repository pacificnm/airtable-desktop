import { describe, expect, it } from 'vitest'
import { buildCacheEntrySnapshot, parseCacheKey } from './cacheEntrySnapshot.ts'

describe('parseCacheKey', () => {
  it('classifies known key shapes', () => {
    expect(parseCacheKey('schema')).toEqual({ kind: 'schema' })
    expect(parseCacheKey('list:tblX:default')).toEqual({
      kind: 'list',
      tableId: 'tblX',
    })
    expect(parseCacheKey('record:tblX:recABC')).toEqual({
      kind: 'record',
      tableId: 'tblX',
    })
    expect(parseCacheKey('linkedLabels:tblX:Name')).toEqual({
      kind: 'linkedLabels',
      tableId: 'tblX',
    })
  })
})

describe('buildCacheEntrySnapshot', () => {
  it('marks expiry relative to now', () => {
    const now = 1_000_000
    const snap = buildCacheEntrySnapshot(
      'schema',
      now + 5000,
      { tables: [{ id: 't1' }, { id: 't2' }] },
      now,
    )
    expect(snap.isExpired).toBe(false)
    expect(snap.expiresInMs).toBe(5000)
    expect(snap.summary).toBe('2 tables')
  })
})
