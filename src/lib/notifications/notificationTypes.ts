/** Severity for in-app / stored notifications. */
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error'

/**
 * Payload published on the notification bus.
 * Any module can emit these; the notifications module persists them when enabled.
 */
export interface NotificationPayload {
  title: string
  body?: string
  severity?: NotificationSeverity
  /** Module id that emitted the notification (e.g. `roles`). */
  sourceModule: string
  /** Optional event name within the source module. */
  eventType?: string
  metadata?: Record<string, unknown>
  /** App route to open when the user activates the notification. */
  linkView?: string
}

export type NotificationListener = (payload: NotificationPayload) => void | Promise<void>
