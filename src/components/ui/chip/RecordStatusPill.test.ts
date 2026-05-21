import { describe, expect, it } from 'vitest'
import { normalizeRecordStatus } from './recordStatus.ts'

describe('normalizeRecordStatus', () => {
  it('maps Active and Deleted case-insensitively', () => {
    expect(normalizeRecordStatus('Active')).toBe('Active')
    expect(normalizeRecordStatus(' active ')).toBe('Active')
    expect(normalizeRecordStatus('DELETED')).toBe('Deleted')
  })

  it('returns undefined for empty or unknown values', () => {
    expect(normalizeRecordStatus('')).toBeUndefined()
    expect(normalizeRecordStatus('Pending')).toBeUndefined()
  })
})
