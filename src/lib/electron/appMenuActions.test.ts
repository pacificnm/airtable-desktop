import { describe, expect, it } from 'vitest'
import { isAppMenuAction, menuActionToAppView } from './appMenuActions.ts'

describe('menuActionToAppView', () => {
  it('maps navigate actions to app views', () => {
    expect(menuActionToAppView('navigate:devTables')).toBe('devTables')
    expect(menuActionToAppView('navigate:devTokens')).toBe('devTokens')
  })

  it('returns null for non-navigate actions', () => {
    expect(menuActionToAppView('openDebugPanel')).toBeNull()
    expect(menuActionToAppView('navigate:unknown')).toBeNull()
  })
})

describe('isAppMenuAction', () => {
  it('accepts openDebugPanel and navigate prefixes', () => {
    expect(isAppMenuAction('openDebugPanel')).toBe(true)
    expect(isAppMenuAction('navigate:configList')).toBe(true)
    expect(isAppMenuAction('invalid')).toBe(false)
  })
})
