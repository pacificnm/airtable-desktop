import type { AirtableTableConfig } from '../../src/config/tableTypes.ts'

/** Replace `tblREPLACE_APP_CONFIG` with your base’s table id after setup. */
export const configModuleTables = [
  {
    key: 'appConfig',
    label: 'App Config',
    tableId: 'tblnkwxCCoTb8y48u',
    tableName: 'App Config',
    primaryField: 'key',
    fields: {
      key: 'Key',
      value: 'Value',
      valueType: 'Value type',
      label: 'Label',
      description: 'Description',
      module: 'Module',
      active: 'Active',
    },
    columns: [
      { field: 'key', label: 'Key' },
      { field: 'value', label: 'Value' },
      { field: 'valueType', label: 'Type' },
      { field: 'module', label: 'Module' },
      { field: 'active', label: 'Active' },
    ],
    list: {
      pageSize: 100,
      sort: [{ field: 'Key', direction: 'asc' }],
    },
    screens: ['configList'],
    validation: {
      key: { required: true },
    },
  },
] as const satisfies readonly AirtableTableConfig[]
