import type { NotificationListener, NotificationPayload } from './notificationTypes.ts'

const listeners = new Set<NotificationListener>()

/**
 * Publish a notification to all subscribers (persistence, toasts, analytics, etc.).
 * Safe to call from any module; subscribers decide what to do.
 */
export function publishNotification(payload: NotificationPayload): void {
  const normalized: NotificationPayload = {
    severity: 'info',
    ...payload,
    title: payload.title.trim(),
    sourceModule: payload.sourceModule.trim(),
  }
  if (!normalized.title || !normalized.sourceModule) return

  for (const listener of listeners) {
    try {
      const result = listener(normalized)
      if (result instanceof Promise) {
        void result.catch((err) => {
          console.error('[notifications] subscriber failed', err)
        })
      }
    } catch (err) {
      console.error('[notifications] subscriber failed', err)
    }
  }
}

/** Subscribe to published notifications. Returns an unsubscribe function. */
export function subscribeNotifications(listener: NotificationListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** @internal Test helper */
export function clearNotificationListeners(): void {
  listeners.clear()
}
