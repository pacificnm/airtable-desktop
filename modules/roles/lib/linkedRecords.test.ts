import { describe, expect, it } from 'vitest'
import {
  isAirtableRecordId,
  parseLinkedRecordNames,
  resolveLinkedRecordLabels,
} from './linkedRecords.ts'

describe('isAirtableRecordId', () => {
  it('detects rec ids', () => {
    expect(isAirtableRecordId('recABC123')).toBe(true)
    expect(isAirtableRecordId('Admin')).toBe(false)
  })
})

describe('parseLinkedRecordNames', () => {
  it('ignores plain record id strings', () => {
    expect(parseLinkedRecordNames(['recXYZ'])).toEqual([])
  })

  it('reads name from linked objects', () => {
    expect(parseLinkedRecordNames([{ id: 'rec1', name: 'Editor' }])).toEqual([
      'Editor',
    ])
  })
})

describe('resolveLinkedRecordLabels', () => {
  it('maps ids to names', () => {
    const map = new Map([['rec1', 'Admin']])
    expect(resolveLinkedRecordLabels(['rec1'], map)).toEqual(['Admin'])
  })
})
