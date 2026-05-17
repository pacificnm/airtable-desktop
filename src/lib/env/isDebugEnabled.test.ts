import { afterEach, describe, expect, it, vi } from 'vitest'

describe('isDebugEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('is true in development', async () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_ENABLE_DEBUG_PANEL', '')
    const { isDebugEnabled } = await import('./isDebugEnabled.ts')
    expect(isDebugEnabled()).toBe(true)
  })

  it('is false in production unless VITE_ENABLE_DEBUG_PANEL is true', async () => {
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_ENABLE_DEBUG_PANEL', '')
    const { isDebugEnabled } = await import('./isDebugEnabled.ts')
    expect(isDebugEnabled()).toBe(false)
  })

  it('can be enabled in production builds via env', async () => {
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_ENABLE_DEBUG_PANEL', 'true')
    const { isDebugEnabled } = await import('./isDebugEnabled.ts')
    expect(isDebugEnabled()).toBe(true)
  })
})
