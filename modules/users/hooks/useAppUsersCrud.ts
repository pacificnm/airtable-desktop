import { useAirtable } from '../../../src/hooks/useAirtable.ts'
import { useAirtableMutation } from '../../../src/hooks/useAirtableMutation.ts'
import {
  appUserFormValuesToAirtableFields,
  type AppUserFormValues,
} from '../lib/userForm.ts'
import type { UsersAuthProvider } from '../lib/usersAuthConfig.ts'
import {
  APP_USERS_TABLE_KEY,
  getAppUsersTableConfig,
} from '../validation/users.ts'

export function useAppUsersCrud(authProvider: UsersAuthProvider) {
  const { client, isReady } = useAirtable()
  const tableConfig = getAppUsersTableConfig()

  const createUser = useAirtableMutation({
    tableKey: APP_USERS_TABLE_KEY,
    mutationFn: async (values: AppUserFormValues) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before saving users.')
      }
      const fields = await appUserFormValuesToAirtableFields(tableConfig, values, {
        authProvider,
        includePassword: true,
      })
      const res = await client.createRecords<Record<string, unknown>>(
        tableConfig.tableId,
        [{ fields }],
      )
      return res.records[0]
    },
  })

  const updateUser = useAirtableMutation({
    tableKey: APP_USERS_TABLE_KEY,
    mutationFn: async ({
      id,
      values,
    }: {
      id: string
      values: AppUserFormValues
    }) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before saving users.')
      }
      const fields = await appUserFormValuesToAirtableFields(tableConfig, values, {
        authProvider,
        includePassword: Boolean(values.password),
      })
      const res = await client.updateRecords<Record<string, unknown>>(
        tableConfig.tableId,
        [{ id, fields }],
      )
      return res.records[0]
    },
  })

  const deleteUser = useAirtableMutation({
    tableKey: APP_USERS_TABLE_KEY,
    mutationFn: async (recordId: string) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before deleting users.')
      }
      await client.deleteRecords(tableConfig.tableId, [recordId])
    },
  })

  return {
    createUser,
    updateUser,
    deleteUser,
    canMutate: isReady && !!tableConfig,
    tableConfig,
  }
}
