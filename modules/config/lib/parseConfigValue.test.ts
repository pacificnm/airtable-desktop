import { describe, expect, it } from 'vitest'
import { parseConfigBoolean, parseConfigValue } from './parseConfigValue.ts'

describe('parseConfigValue', () => {
  it('parses boolean strings', () => {
    expect(parseConfigValue('true', 'boolean')).toBe(true)
    expect(parseConfigValue('false', 'boolean')).toBe(false)
  })

  it('parses numbers', () => {
    expect(parseConfigValue('42', 'number')).toBe(42)
  })

  it('parses json', () => {
    expect(parseConfigValue('{"a":1}', 'json')).toEqual({ a: 1 })
  })
})

describe('parseConfigBoolean', () => {
  it('defaults when missing', () => {
    expect(parseConfigBoolean(undefined, 'string', true)).toBe(true)
    expect(parseConfigBoolean(undefined, 'string', false)).toBe(false)
  })
})
