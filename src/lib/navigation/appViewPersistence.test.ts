import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isValidAppView,
  readLastAppView,
  writeLastAppView,
} from './appViewPersistence.ts'

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

describe('appViewPersistence', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', mockLocalStorage())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('defaults to home when nothing stored', () => {
    expect(readLastAppView()).toBe('home')
  })

  it('round-trips a valid view', () => {
    writeLastAppView('devTables')
    expect(readLastAppView()).toBe('devTables')
  })

  it('ignores unknown stored values', () => {
    localStorage.setItem('app.lastView.v1', 'notARealScreen')
    expect(readLastAppView()).toBe('home')
  })

  it('validates against registered screens', () => {
    expect(isValidAppView('devDocs')).toBe(true)
    expect(isValidAppView('missing')).toBe(false)
  })
})
