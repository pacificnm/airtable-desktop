import type { AirtableTableConfig } from '../../../src/config/tables.ts'
import { mapConfigToAirtableFields } from '../../../src/lib/airtable/mapRecordFields.ts'
import { linkedRecordIdsForWrite } from './linkedRecords.ts'
import type { RolePermission } from './permissionFromRecords.ts'

export type PermissionAction = 'read' | 'write' | 'delete' | 'admin'

export const PERMISSION_ACTION_OPTIONS: readonly {
  value: PermissionAction
  label: string
}[] = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'delete', label: 'Delete' },
  { value: 'admin', label: 'Admin' },
]

export interface RolePermissionFormValues {
  label: string
  roleId: string
  resource: string
  action: PermissionAction
  allowed: boolean
}

export function normalizePermissionAction(raw: unknown): PermissionAction {
  const s = String(raw ?? 'read').toLowerCase().trim()
  if (s === 'write' || s === 'delete' || s === 'admin') return s
  return 'read'
}

export function emptyRolePermissionFormValues(): RolePermissionFormValues {
  return {
    label: '',
    roleId: '',
    resource: '',
    action: 'read',
    allowed: true,
  }
}

export function permissionToFormValues(
  permission: RolePermission,
): RolePermissionFormValues {
  return {
    label: permission.label,
    roleId: permission.roleIds[0] ?? '',
    resource: permission.resource,
    action: permission.action,
    allowed: permission.allowed,
  }
}

export function rolePermissionFormValuesToAirtableFields(
  config: AirtableTableConfig,
  values: RolePermissionFormValues,
): Record<string, unknown> {
  const roleIds = linkedRecordIdsForWrite(values.roleId)
  return mapConfigToAirtableFields(config, {
    label: values.label.trim(),
    role: roleIds,
    resource: values.resource.trim(),
    action: values.action,
    allowed: values.allowed,
  })
}

export function validateRolePermissionFormValues(
  values: RolePermissionFormValues,
): string | null {
  if (!values.label.trim()) return 'Label is required.'
  if (!values.resource.trim()) return 'Resource is required.'
  if (!values.roleId.trim()) return 'Role is required.'
  return null
}
