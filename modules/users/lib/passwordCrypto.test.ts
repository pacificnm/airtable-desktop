import { describe, expect, it } from 'vitest'
import { hashPassword, isPasswordHashStored, verifyPassword } from './passwordCrypto.ts'

describe('passwordCrypto', () => {
  it('hashes and verifies', async () => {
    const stored = await hashPassword('secret-pass')
    expect(isPasswordHashStored(stored)).toBe(true)
    expect(await verifyPassword('secret-pass', stored)).toBe(true)
    expect(await verifyPassword('wrong', stored)).toBe(false)
  })
})
