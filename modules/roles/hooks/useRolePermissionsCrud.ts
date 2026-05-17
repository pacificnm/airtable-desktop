import { useAirtable } from '../../../src/hooks/useAirtable.ts'
import { useAirtableMutation } from '../../../src/hooks/useAirtableMutation.ts'
import {
  rolePermissionFormValuesToAirtableFields,
  type RolePermissionFormValues,
} from '../lib/permissionForm.ts'
import {
  getRolePermissionsTableConfig,
  ROLE_PERMISSIONS_TABLE_KEY,
} from '../validation/roles.ts'

export function useRolePermissionsCrud() {
  const { client, isReady } = useAirtable()
  const tableConfig = getRolePermissionsTableConfig()

  const createPermission = useAirtableMutation({
    tableKey: ROLE_PERMISSIONS_TABLE_KEY,
    mutationFn: async (values: RolePermissionFormValues) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before saving permissions.')
      }
      const fields = rolePermissionFormValuesToAirtableFields(
        tableConfig,
        values,
      )
      const res = await client.createRecords<Record<string, unknown>>(
        tableConfig.tableId,
        [{ fields }],
      )
      return res.records[0]
    },
  })

  const updatePermission = useAirtableMutation({
    tableKey: ROLE_PERMISSIONS_TABLE_KEY,
    mutationFn: async ({
      id,
      values,
    }: {
      id: string
      values: RolePermissionFormValues
    }) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before saving permissions.')
      }
      const fields = rolePermissionFormValuesToAirtableFields(
        tableConfig,
        values,
      )
      const res = await client.updateRecords<Record<string, unknown>>(
        tableConfig.tableId,
        [{ id, fields }],
      )
      return res.records[0]
    },
  })

  const deletePermission = useAirtableMutation({
    tableKey: ROLE_PERMISSIONS_TABLE_KEY,
    mutationFn: async (recordId: string) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before deleting permissions.')
      }
      await client.deleteRecords(tableConfig.tableId, [recordId])
    },
  })

  return {
    createPermission,
    updatePermission,
    deletePermission,
    canMutate: isReady && !!tableConfig,
    tableConfig,
  }
}
