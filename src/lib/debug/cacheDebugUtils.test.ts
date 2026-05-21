import { describe, expect, it } from 'vitest'
import { formatCacheJson } from './cacheDebugUtils.ts'

describe('formatCacheJson', () => {
  it('pretty-prints objects', () => {
    const { text, truncated } = formatCacheJson({ a: 1 })
    expect(truncated).toBe(false)
    expect(text).toContain('"a": 1')
  })

  it('truncates very large payloads', () => {
    const big = { items: 'x'.repeat(100_000) }
    const { truncated, totalChars } = formatCacheJson(big, 500)
    expect(truncated).toBe(true)
    expect(totalChars).toBeGreaterThan(500)
  })
})
