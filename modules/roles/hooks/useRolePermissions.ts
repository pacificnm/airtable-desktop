import { useMemo } from 'react'
import { useAirtableListQuery } from '../../../src/hooks/useAirtableTableQuery.ts'
import {
  rolePermissionsFromRecords,
  type RolePermission,
} from '../lib/permissionFromRecords.ts'
import { ROLE_PERMISSIONS_TABLE_KEY } from '../validation/roles.ts'

/** List role permissions from the module’s Role Permissions table. */
export function useRolePermissions() {
  const query = useAirtableListQuery(ROLE_PERMISSIONS_TABLE_KEY)

  const permissions = useMemo((): RolePermission[] => {
    const records = query.data?.records ?? []
    return rolePermissionsFromRecords(records)
  }, [query.data?.records])

  return { ...query, permissions }
}
