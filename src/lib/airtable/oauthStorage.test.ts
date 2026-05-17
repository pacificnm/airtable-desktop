import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearOAuthPending,
  readOAuthPending,
  writeOAuthPending,
} from './oauthStorage.ts'

function mockWebStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
    removeItem: (key: string) => {
      data.delete(key)
    },
    clear: () => data.clear(),
  }
}

describe('oauthStorage pending', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', mockWebStorage())
    vi.stubGlobal('sessionStorage', mockWebStorage())
  })

  afterEach(() => {
    clearOAuthPending()
    vi.unstubAllGlobals()
  })

  it('persists PKCE pending in localStorage', () => {
    writeOAuthPending({ state: 'state-abc', verifier: 'verifier-xyz' })
    expect(localStorage.getItem('airtable.oauth.pending')).toContain('state-abc')
    const pending = readOAuthPending()
    expect(pending?.state).toBe('state-abc')
    expect(pending?.verifier).toBe('verifier-xyz')
    expect(pending?.createdAtMs).toBeGreaterThan(0)
  })
})
