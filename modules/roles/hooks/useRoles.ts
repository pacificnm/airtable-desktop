import { useMemo } from 'react'
import { useAirtableListQuery } from '../../../src/hooks/useAirtableTableQuery.ts'
import { rolesFromRecords, type Role } from '../lib/roleFromRecords.ts'
import { ROLES_TABLE_KEY } from '../validation/roles.ts'

/** List roles from the module’s Roles table. */
export function useRoles(options?: { activeOnly?: boolean }) {
  const query = useAirtableListQuery(ROLES_TABLE_KEY)

  const roles = useMemo((): Role[] => {
    const records = query.data?.records ?? []
    const all = rolesFromRecords(records)
    if (options?.activeOnly) return all.filter((r) => r.active)
    return all
  }, [query.data?.records, options?.activeOnly])

  return { ...query, roles }
}
