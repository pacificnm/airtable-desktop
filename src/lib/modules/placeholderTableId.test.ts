import { describe, expect, it } from 'vitest'
import { placeholderTableId } from './placeholderTableId.ts'

describe('placeholderTableId', () => {
  it('builds REPLACE ids from table keys', () => {
    expect(placeholderTableId('appUsers')).toBe('tblREPLACE_APP_USERS')
    expect(placeholderTableId('appConfig')).toBe('tblREPLACE_APP_CONFIG')
  })
})
