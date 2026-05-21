import { describe, expect, it } from 'vitest'
import {
  dataFileMappingRegistry,
  validateAllDataFileMappings,
} from './registry.ts'

describe('dataFileMappingRegistry', () => {
  it('registers every module mapping with unique ids', () => {
    const ids = dataFileMappingRegistry.map((e) => e.mapping.id)
    expect(ids.length).toBe(new Set(ids).size)
    expect(ids.length).toBeGreaterThanOrEqual(6)
  })

  it('validates all entries against tables.ts', () => {
    const results = validateAllDataFileMappings()
    const failures = results.filter((r) => r.issues.length > 0)
    expect(failures).toEqual([])
  })
})
