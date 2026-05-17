import { describe, expect, it } from 'vitest'
import { formatErrorEntryForCopy } from './errorDebugUtils.ts'
import type { DebugErrorEntry } from './types.ts'

describe('formatErrorEntryForCopy', () => {
  it('includes message, metadata, frames, and stack', () => {
    const entry: Omit<DebugErrorEntry, 'id' | 'timestamp'> & {
      id: string
      timestamp: number
    } = {
      id: 'e1',
      timestamp: Date.parse('2026-01-01T12:00:00.000Z'),
      message: 'Failed to fetch',
      source: 'fetch',
      location: 'src/screens/Foo.tsx:42',
      detail: 'https://api.airtable.com/v0/x',
      stack: 'Error: Failed to fetch\n    at load (Foo.tsx:42:10)',
      frames: [
        {
          file: 'src/screens/Foo.tsx',
          line: 42,
          column: 10,
          name: 'load',
        },
      ],
    }

    const text = formatErrorEntryForCopy(entry)
    expect(text).toContain('Message: Failed to fetch')
    expect(text).toContain('Source: fetch')
    expect(text).toContain('Location: src/screens/Foo.tsx:42')
    expect(text).toContain('Detail: https://api.airtable.com/v0/x')
    expect(text).toContain('at load (src/screens/Foo.tsx:42:10)')
    expect(text).toContain('Stack trace:')
    expect(text).toContain('Error: Failed to fetch')
  })
})
