import { afterEach, describe, expect, it, vi } from 'vitest'
import { allowsClientDebugHeaders } from './fetchWithRetry.ts'

describe('allowsClientDebugHeaders', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('allows headers for same-origin proxy paths', () => {
    vi.stubGlobal('window', { location: { origin: 'http://127.0.0.1:5173' } })
    expect(allowsClientDebugHeaders('/__airtable_api/v0/meta/whoami')).toBe(true)
  })

  it('blocks headers for direct Airtable API URLs', () => {
    vi.stubGlobal('window', { location: { origin: 'http://127.0.0.1:5173' } })
    expect(
      allowsClientDebugHeaders('https://api.airtable.com/v0/meta/whoami'),
    ).toBe(false)
  })
})
