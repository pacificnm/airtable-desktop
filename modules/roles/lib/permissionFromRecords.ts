import type { NormalizedRecord } from '../../../src/lib/airtable/mapRecordFields.ts'
import {
  parseLinkedRecordIds,
  parseLinkedRecordNames,
} from './linkedRecords.ts'
import {
  normalizePermissionAction,
  type PermissionAction,
} from './permissionForm.ts'

export interface RolePermission {
  id: string
  label: string
  roleIds: string[]
  roleNames: string[]
  resource: string
  action: PermissionAction
  allowed: boolean
}

type PermissionFields = {
  label?: string
  role?: unknown
  resource?: string
  action?: unknown
  allowed?: unknown
}

function parseAllowed(raw: unknown): boolean {
  if (raw === undefined || raw === null) return false
  if (typeof raw === 'boolean') return raw
  return String(raw).toLowerCase() === 'true'
}

export function recordToRolePermission(
  record: NormalizedRecord<PermissionFields>,
): RolePermission | null {
  const label = record.fields.label?.trim()
  const resource = record.fields.resource?.trim()
  if (!label || !resource) return null

  const roleIds = parseLinkedRecordIds(record.fields.role)
  const roleNames = parseLinkedRecordNames(record.fields.role)

  return {
    id: record.id,
    label,
    roleIds,
    roleNames,
    resource,
    action: normalizePermissionAction(record.fields.action),
    allowed: parseAllowed(record.fields.allowed),
  }
}

export function rolePermissionsFromRecords(
  records: readonly NormalizedRecord<PermissionFields>[],
): RolePermission[] {
  return records
    .map(recordToRolePermission)
    .filter((p): p is RolePermission => p != null)
}
