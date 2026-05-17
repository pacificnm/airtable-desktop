import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isRecordViewMode,
  readRecordViewMode,
  recordViewStorageKey,
  writeRecordViewMode,
} from './recordViewPersistence.ts'

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

describe('recordViewPersistence', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', mockLocalStorage())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses per-screen keys', () => {
    expect(recordViewStorageKey('configList')).toBe('recordView.v1.configList')
  })

  it('defaults to grid when nothing stored', () => {
    expect(readRecordViewMode('rolesList')).toBe('grid')
  })

  it('round-trips card per screen', () => {
    writeRecordViewMode('configList', 'card')
    writeRecordViewMode('rolesList', 'grid')
    expect(readRecordViewMode('configList')).toBe('card')
    expect(readRecordViewMode('rolesList')).toBe('grid')
  })

  it('ignores invalid stored values', () => {
    localStorage.setItem(recordViewStorageKey('usersList'), 'table')
    expect(readRecordViewMode('usersList')).toBe('grid')
  })

  it('validates record view modes', () => {
    expect(isRecordViewMode('grid')).toBe(true)
    expect(isRecordViewMode('card')).toBe(true)
    expect(isRecordViewMode('list')).toBe(false)
  })
})
