import { describe, expect, it } from 'vitest'
import { normalizeBaseId } from './baseId.ts'

describe('normalizeBaseId', () => {
  it('extracts app id from path with table segment', () => {
    expect(normalizeBaseId('appkxFxNVpj0ipcfh/tbl8Xbuy9pdK5ClVO')).toBe(
      'appkxFxNVpj0ipcfh',
    )
  })

  it('returns plain app id unchanged', () => {
    expect(normalizeBaseId('appABCDEF123456')).toBe('appABCDEF123456')
  })

  it('handles empty input', () => {
    expect(normalizeBaseId('')).toBeUndefined()
    expect(normalizeBaseId(undefined)).toBeUndefined()
  })
})
