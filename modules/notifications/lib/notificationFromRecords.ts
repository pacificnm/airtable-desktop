import type { NormalizedRecord } from '../../../src/lib/airtable/mapRecordFields.ts'
import type { NotificationSeverity } from '../../../src/lib/notifications/notificationTypes.ts'

export interface AppNotification {
  id: string
  title: string
  body?: string
  severity: NotificationSeverity
  sourceModule: string
  eventType?: string
  read: boolean
  metadata?: Record<string, unknown>
  linkView?: string
  createdAt?: string
}

type NotificationFields = {
  title?: string
  body?: string
  severity?: unknown
  sourceModule?: string
  eventType?: string
  read?: unknown
  metadata?: string
  linkView?: string
}

const SEVERITIES = new Set<NotificationSeverity>([
  'info',
  'success',
  'warning',
  'error',
])

function parseSeverity(raw: unknown): NotificationSeverity {
  const s = String(raw ?? 'info').toLowerCase()
  return SEVERITIES.has(s as NotificationSeverity)
    ? (s as NotificationSeverity)
    : 'info'
}

function parseRead(raw: unknown): boolean {
  if (raw === undefined || raw === null) return false
  if (typeof raw === 'boolean') return raw
  return String(raw).toLowerCase() === 'true'
}

function parseMetadata(raw: unknown): Record<string, unknown> | undefined {
  if (raw == null || raw === '') return undefined
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }
  const text = String(raw).trim()
  if (!text) return undefined
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return undefined
  }
}

export function recordToNotification(
  record: NormalizedRecord<NotificationFields>,
): AppNotification | null {
  const title = record.fields.title?.trim()
  if (!title) return null

  return {
    id: record.id,
    title,
    body: record.fields.body?.trim() || undefined,
    severity: parseSeverity(record.fields.severity),
    sourceModule: record.fields.sourceModule?.trim() || 'unknown',
    eventType: record.fields.eventType?.trim() || undefined,
    read: parseRead(record.fields.read),
    metadata: parseMetadata(record.fields.metadata),
    linkView: record.fields.linkView?.trim() || undefined,
    createdAt: record.createdTime,
  }
}
