import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearNotificationListeners,
  publishNotification,
  subscribeNotifications,
} from './notificationBus.ts'

describe('notificationBus', () => {
  afterEach(() => {
    clearNotificationListeners()
  })

  it('notifies subscribers', () => {
    const fn = vi.fn()
    subscribeNotifications(fn)
    publishNotification({
      title: 'Hello',
      sourceModule: 'roles',
      severity: 'success',
    })
    expect(fn).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Hello', sourceModule: 'roles' }),
    )
  })

  it('unsubscribes cleanly', () => {
    const fn = vi.fn()
    const off = subscribeNotifications(fn)
    off()
    publishNotification({ title: 'X', sourceModule: 'test' })
    expect(fn).not.toHaveBeenCalled()
  })

  it('ignores empty title or source', () => {
    const fn = vi.fn()
    subscribeNotifications(fn)
    publishNotification({ title: '  ', sourceModule: 'roles' })
    publishNotification({ title: 'Ok', sourceModule: '' })
    expect(fn).not.toHaveBeenCalled()
  })
})
