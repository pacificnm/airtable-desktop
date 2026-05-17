import { useAirtable } from '../../../src/hooks/useAirtable.ts'
import { useAirtableMutation } from '../../../src/hooks/useAirtableMutation.ts'
import type { AirtableRecord } from '../../../src/lib/airtable/types.ts'
import {
  configFormValuesToAirtableFields,
  type ConfigEntryFormValues,
} from '../lib/configForm.ts'
import {
  APP_CONFIG_TABLE_KEY,
  getAppConfigTableConfig,
} from '../validation/config.ts'

export function useAppConfigCrud() {
  const { client, isReady } = useAirtable()
  const tableConfig = getAppConfigTableConfig()

  const createEntry = useAirtableMutation({
    tableKey: APP_CONFIG_TABLE_KEY,
    mutationFn: async (values: ConfigEntryFormValues) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before saving config.')
      }
      const fields = configFormValuesToAirtableFields(tableConfig, values)
      const res = await client.createRecords<Record<string, unknown>>(
        tableConfig.tableId,
        [{ fields }],
      )
      return res.records[0]
    },
  })

  const updateEntry = useAirtableMutation({
    tableKey: APP_CONFIG_TABLE_KEY,
    mutationFn: async ({
      id,
      values,
    }: {
      id: string
      values: ConfigEntryFormValues
    }) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before saving config.')
      }
      const fields = configFormValuesToAirtableFields(tableConfig, values)
      const res = await client.updateRecords<Record<string, unknown>>(
        tableConfig.tableId,
        [{ id, fields }],
      )
      return res.records[0]
    },
  })

  const deleteEntry = useAirtableMutation({
    tableKey: APP_CONFIG_TABLE_KEY,
    mutationFn: async (recordId: string) => {
      if (!client || !tableConfig) {
        throw new Error('Connect to Airtable before deleting config.')
      }
      await client.deleteRecords(tableConfig.tableId, [recordId])
    },
  })

  return {
    createEntry,
    updateEntry,
    deleteEntry,
    canMutate: isReady && !!tableConfig,
    tableConfig,
  }
}

export type AppConfigCrudRecord = AirtableRecord<Record<string, unknown>>
