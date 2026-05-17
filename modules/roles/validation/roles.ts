import type { AirtableTableConfig } from '../../../src/config/tables.ts'
import { getTableConfig } from '../../../src/config/tables.ts'

export const ROLES_TABLE_KEY = 'roles'
export const ROLE_PERMISSIONS_TABLE_KEY = 'rolePermissions'

export function getRolesTableConfig(): AirtableTableConfig | undefined {
  return getTableConfig(ROLES_TABLE_KEY)
}

export function getRolePermissionsTableConfig():
  | AirtableTableConfig
  | undefined {
  return getTableConfig(ROLE_PERMISSIONS_TABLE_KEY)
}
