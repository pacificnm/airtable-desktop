import { describe, expect, it } from 'vitest'
import { resolveOAuthRedirectUri } from './oauthSetup.ts'

describe('resolveOAuthRedirectUri', () => {
  it('uses window origin when env has localhost but app is on 127.0.0.1', () => {
    expect(
      resolveOAuthRedirectUri(
        'http://localhost:5173/',
        'http://127.0.0.1:5173',
      ),
    ).toBe('http://127.0.0.1:5173/')
  })

  it('keeps configured URI when origins match', () => {
    expect(
      resolveOAuthRedirectUri(
        'http://127.0.0.1:5173/',
        'http://127.0.0.1:5173',
      ),
    ).toBe('http://127.0.0.1:5173/')
  })
})
