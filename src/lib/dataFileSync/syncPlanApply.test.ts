import { describe, expect, it } from 'vitest'
import {
  applyableSyncPlanItems,
  canApplyPartialDataFileSyncPlan,
} from './syncPlanApply.ts'

describe('syncPlanApply', () => {
  it('allows apply when some rows are invalid but others are updates', () => {
    expect(
      canApplyPartialDataFileSyncPlan({ create: 1, update: 2 }),
    ).toBe(true)
  })

  it('filters to create and update actions only', () => {
    const items = applyableSyncPlanItems([
      { action: 'skip' },
      { action: 'update' },
      { action: 'invalid' },
      { action: 'create' },
    ])
    expect(items.map((i) => i.action)).toEqual(['update', 'create'])
  })
})
