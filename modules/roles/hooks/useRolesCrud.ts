import { useAirtable } from '../../../src/hooks/useAirtable.ts'
import { useAirtableMutation } from '../../../src/hooks/useAirtableMutation.ts'
import {
  roleFormValuesToAirtableFields,
  type RoleFormValues,
} from '../lib/roleForm.ts'
import { getRolesTableConfig, ROLES_TABLE_KEY } from '../validation/roles.ts'

export function useRolesCrud() {
  const { client, isReady } = useAirtable()
  const tableConfig = getRolesTableConfig()

  const createRole = useAirtableMutation({
    tableKey: ROLES_TABLE_KEY,
    mutationFn: async (values: RoleFormValues) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before saving roles.')
      }
      const fields = roleFormValuesToAirtableFields(tableConfig, values)
      const res = await client.createRecords<Record<string, unknown>>(
        tableConfig.tableId,
        [{ fields }],
      )
      return res.records[0]
    },
  })

  const updateRole = useAirtableMutation({
    tableKey: ROLES_TABLE_KEY,
    mutationFn: async ({
      id,
      values,
    }: {
      id: string
      values: RoleFormValues
    }) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before saving roles.')
      }
      const fields = roleFormValuesToAirtableFields(tableConfig, values)
      const res = await client.updateRecords<Record<string, unknown>>(
        tableConfig.tableId,
        [{ id, fields }],
      )
      return res.records[0]
    },
  })

  const deleteRole = useAirtableMutation({
    tableKey: ROLES_TABLE_KEY,
    mutationFn: async (recordId: string) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before deleting roles.')
      }
      await client.deleteRecords(tableConfig.tableId, [recordId])
    },
  })

  return {
    createRole,
    updateRole,
    deleteRole,
    canMutate: isReady && !!tableConfig,
    tableConfig,
  }
}
