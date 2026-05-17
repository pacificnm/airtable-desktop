import type { NormalizedRecord } from '../../../src/lib/airtable/mapRecordFields.ts'

export interface Role {
  id: string
  name: string
  description?: string
  active: boolean
}

type RoleFields = {
  name?: string
  description?: string
  active?: unknown
}

function parseActive(raw: unknown): boolean {
  if (raw === undefined || raw === null) return true
  if (typeof raw === 'boolean') return raw
  return String(raw).toLowerCase() === 'true'
}

export function recordToRole(
  record: NormalizedRecord<RoleFields>,
): Role | null {
  const name = record.fields.name?.trim()
  if (!name) return null
  return {
    id: record.id,
    name,
    description: record.fields.description?.trim() || undefined,
    active: parseActive(record.fields.active),
  }
}

export function rolesFromRecords(
  records: readonly NormalizedRecord<RoleFields>[],
): Role[] {
  return records
    .map(recordToRole)
    .filter((r): r is Role => r != null)
}
