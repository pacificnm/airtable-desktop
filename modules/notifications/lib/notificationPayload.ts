import type { NotificationPayload } from '../../../src/lib/notifications/notificationTypes.ts'
import type { AirtableTableConfig } from '../../../src/config/tables.ts'

export function notificationPayloadToAirtableFields(
  config: AirtableTableConfig,
  payload: NotificationPayload,
): Record<string, unknown> {
  const f = config.fields
  const fields: Record<string, unknown> = {}

  fields[f.title ?? 'Title'] = payload.title
  if (payload.body) fields[f.body ?? 'Body'] = payload.body
  fields[f.severity ?? 'Severity'] = payload.severity ?? 'info'
  fields[f.sourceModule ?? 'Source module'] = payload.sourceModule
  if (payload.eventType) fields[f.eventType ?? 'Event type'] = payload.eventType
  fields[f.read ?? 'Read'] = false
  if (payload.linkView) fields[f.linkView ?? 'Link view'] = payload.linkView
  if (payload.metadata && Object.keys(payload.metadata).length > 0) {
    fields[f.metadata ?? 'Metadata'] = JSON.stringify(payload.metadata)
  }

  return fields
}
