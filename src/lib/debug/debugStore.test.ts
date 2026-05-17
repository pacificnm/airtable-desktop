import { beforeEach, describe, expect, it, vi } from 'vitest'
import { debugStore } from './debugStore.ts'

describe('debugStore', () => {
  beforeEach(() => {
    debugStore.clearAll()
  })

  it('returns the same snapshot reference until the store updates', () => {
    const a = debugStore.getSnapshot()
    const b = debugStore.getSnapshot()
    expect(a).toBe(b)

    debugStore.addNetwork({
      url: 'https://api.airtable.com/v0/foo',
      method: 'GET',
      ok: true,
      status: 200,
      durationMs: 12,
    })

    const c = debugStore.getSnapshot()
    expect(c).not.toBe(a)
    expect(debugStore.getSnapshot()).toBe(c)
    expect(c.network).toHaveLength(1)
  })

  it('notifies subscribers on changes', () => {
    const listener = vi.fn()
    const unsub = debugStore.subscribe(listener)
    debugStore.addError({ message: 'boom', source: 'test' })
    expect(listener).toHaveBeenCalledTimes(1)
    unsub()
    debugStore.addError({ message: 'again', source: 'test' })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('redacts access_token in network URLs', () => {
    debugStore.addNetwork({
      url: 'https://airtable.com/oauth?access_token=secret123&foo=bar',
      method: 'GET',
      ok: true,
      status: 200,
      durationMs: 1,
    })
    expect(debugStore.getSnapshot().network[0]?.url).toBe(
      'https://airtable.com/oauth?access_token=***&foo=bar',
    )
  })

  it('tracks failed network and error counts in the snapshot', () => {
    debugStore.addNetwork({
      url: 'https://api.airtable.com/v0/x',
      method: 'GET',
      ok: false,
      status: 429,
      durationMs: 5,
    })
    debugStore.addError({ message: 'rate limited', source: 'fetch' })

    const snap = debugStore.getSnapshot()
    expect(snap.failedNetworkCount).toBe(1)
    expect(snap.errorCount).toBe(1)
  })

  it('caps network entries at 80', () => {
    for (let i = 0; i < 85; i++) {
      debugStore.addNetwork({
        url: `https://example.com/${i}`,
        method: 'GET',
        ok: true,
        status: 200,
        durationMs: 1,
      })
    }
    expect(debugStore.getSnapshot().network).toHaveLength(80)
    expect(debugStore.getSnapshot().network[0]?.url).toBe(
      'https://example.com/84',
    )
  })

  it('clearNetwork and clearErrors reset slices without dropping perf until set', () => {
    debugStore.setPerf([{ id: 'lcp', label: 'LCP', value: '1.2s' }])
    debugStore.addNetwork({
      url: 'https://example.com',
      method: 'GET',
      ok: true,
      status: 200,
      durationMs: 1,
    })
    debugStore.addError({ message: 'e', source: 'test' })

    debugStore.clearNetwork()
    let snap = debugStore.getSnapshot()
    expect(snap.network).toHaveLength(0)
    expect(snap.errors).toHaveLength(1)
    expect(snap.perf).toHaveLength(1)

    debugStore.clearErrors()
    snap = debugStore.getSnapshot()
    expect(snap.errors).toHaveLength(0)
    expect(snap.perf).toHaveLength(1)
  })
})
