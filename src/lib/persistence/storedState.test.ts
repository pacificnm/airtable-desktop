import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildStorageKey,
  readStoredState,
  removeStoredState,
  writeStoredState,
} from './storedState.ts'

function mockLocalStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
    removeItem: (key) => {
      map.delete(key)
    },
    key: (index) => [...map.keys()][index] ?? null,
  }
}

interface Filters {
  search: string
  region: string
}

const isFilters = (value: unknown): value is Filters =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Filters).search === 'string' &&
  typeof (value as Filters).region === 'string'

describe('storedState', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', mockLocalStorage())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('round-trips structured state', () => {
    const fallback: Filters = { search: '', region: '' }
    writeStoredState('filters.v1.test', { search: 'hq', region: 'West' })
    expect(readStoredState<Filters>('filters.v1.test', fallback)).toEqual({
      search: 'hq',
      region: 'West',
    })
  })

  it('returns fallback when nothing stored', () => {
    const fallback: Filters = { search: '', region: '' }
    expect(readStoredState('filters.v1.missing', fallback)).toEqual(fallback)
  })

  it('rejects values that fail validation', () => {
    const fallback: Filters = { search: '', region: '' }
    localStorage.setItem('filters.v1.bad', JSON.stringify({ search: 1 }))
    expect(
      readStoredState('filters.v1.bad', fallback, { validate: isFilters }),
    ).toEqual(fallback)
  })

  it('ignores malformed JSON', () => {
    const fallback: Filters = { search: '', region: '' }
    localStorage.setItem('filters.v1.bad', '{not json')
    expect(readStoredState('filters.v1.bad', fallback)).toEqual(fallback)
  })

  it('removeStoredState clears the slot', () => {
    writeStoredState('filters.v1.test', { search: 'x', region: '' })
    removeStoredState('filters.v1.test')
    expect(localStorage.getItem('filters.v1.test')).toBeNull()
  })

  it('buildStorageKey skips empty segments', () => {
    expect(buildStorageKey('filters.v1', 'locationsList', 'appXYZ')).toBe(
      'filters.v1.locationsList.appXYZ',
    )
    expect(buildStorageKey('filters.v1', 'locationsList', undefined)).toBe(
      'filters.v1.locationsList',
    )
    expect(buildStorageKey('filters.v1', '  ', null)).toBe('filters.v1')
  })
})
