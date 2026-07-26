import type { AirtableTableConfig } from '@/config/tableTypes.ts'

/**
 * Field map synced from Airtable (read-only meta API). Does not create or modify base schema.
 * Regenerate via Developer → Modules → Sync schema from Airtable.
 * For select colors and full field options, see `tables.meta.ts` in this folder.
 */
export const configModuleTables = [
  {
    key: 'appConfig',
    label: 'App Config',
    tableId: 'tblnkwxCCoTb8y48u',
    tableName: 'App Config',
    primaryField: 'key',
    fields: {
      active: 'Active',
      description: 'Description',
      key: 'Key',
      label: 'Label',
      module: 'Module',
      value: 'Value',
      valueType: 'Value type',
    },
    columns: [
      { field: 'active', label: 'Active' },
      { field: 'description', label: 'Description' },
      { field: 'key', label: 'Key' },
      { field: 'label', label: 'Label' },
      { field: 'module', label: 'Module' },
      { field: 'value', label: 'Value' },
      { field: 'valueType', label: 'Value type' },
    ],
    list: { pageSize: 100, sort: [{ field: 'Key', direction: 'asc' }] },
    screens: ['configList'],
    validation: {
      key: { required: true },
    },
  },
] as const satisfies readonly AirtableTableConfig[]
