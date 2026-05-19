import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  popEntry,
  pushEntry,
  readNavigationStack,
  replaceTop,
  topEntry,
  writeNavigationStack,
} from './navigationStack.ts'

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

describe('navigationStack', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', mockLocalStorage())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('defaults to home with empty params', () => {
    const stack = readNavigationStack()
    expect(topEntry(stack)).toEqual({ view: 'home', params: {} })
  })

  it('pushes new entries with params', () => {
    let stack = readNavigationStack()
    stack = pushEntry(stack, 'devTables', { foo: 'bar' })
    expect(topEntry(stack)).toEqual({ view: 'devTables', params: { foo: 'bar' } })
    expect(stack.entries.length).toBe(2)
  })

  it('does not duplicate identical pushes', () => {
    let stack = readNavigationStack()
    stack = pushEntry(stack, 'devTables', { foo: 'bar' })
    const before = stack.entries.length
    stack = pushEntry(stack, 'devTables', { foo: 'bar' })
    expect(stack.entries.length).toBe(before)
  })

  it('pops back to the previous entry', () => {
    let stack = readNavigationStack()
    stack = pushEntry(stack, 'devDocs')
    stack = pushEntry(stack, 'devModules')
    stack = popEntry(stack)
    expect(topEntry(stack).view).toBe('devDocs')
  })

  it('popping the root entry is a no-op', () => {
    const stack = readNavigationStack()
    expect(popEntry(stack)).toBe(stack)
  })

  it('replaces the top without growing the stack', () => {
    let stack = readNavigationStack()
    stack = pushEntry(stack, 'devDocs')
    const len = stack.entries.length
    stack = replaceTop(stack, 'devTables', { tableId: 'tblX' })
    expect(stack.entries.length).toBe(len)
    expect(topEntry(stack)).toEqual({ view: 'devTables', params: { tableId: 'tblX' } })
  })

  it('persists and re-hydrates the stack', () => {
    let stack = readNavigationStack()
    stack = pushEntry(stack, 'devTables', { tableId: 'tblY' })
    writeNavigationStack(stack)
    const next = readNavigationStack()
    expect(topEntry(next)).toEqual({ view: 'devTables', params: { tableId: 'tblY' } })
    expect(next.entries.length).toBe(2)
  })

  it('ignores corrupt persisted data', () => {
    localStorage.setItem('app.navigation.v1', '{not json')
    expect(topEntry(readNavigationStack())).toEqual({ view: 'home', params: {} })
  })

  it('filters out entries with unknown views', () => {
    localStorage.setItem(
      'app.navigation.v1',
      JSON.stringify({
        entries: [
          { view: 'home', params: {} },
          { view: 'doesNotExist', params: {} },
        ],
      }),
    )
    const stack = readNavigationStack()
    expect(stack.entries.length).toBe(1)
    expect(topEntry(stack).view).toBe('home')
  })
})
