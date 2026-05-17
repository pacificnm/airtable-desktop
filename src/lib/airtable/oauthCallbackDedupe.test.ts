import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  resetOAuthCallbackDedupeForTests,
  runOAuthCallbackOnce,
} from './oauthCallbackDedupe.ts'

describe('runOAuthCallbackOnce', () => {
  afterEach(() => {
    resetOAuthCallbackDedupeForTests()
  })

  it('runs execute only once for the same code', async () => {
    const execute = vi.fn(async () => {})
    const [a, b] = await Promise.all([
      runOAuthCallbackOnce('code-1', execute),
      runOAuthCallbackOnce('code-1', execute),
    ])
    expect(execute).toHaveBeenCalledTimes(1)
    expect(a).toBe('exchanged')
    expect(b).toBe('exchanged')
  })

  it('returns already_done after a successful exchange', async () => {
    await runOAuthCallbackOnce('code-2', async () => {})
    const again = await runOAuthCallbackOnce('code-2', async () => {
      throw new Error('should not run')
    })
    expect(again).toBe('already_done')
  })
})
