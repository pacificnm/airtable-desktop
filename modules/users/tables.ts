import type { AirtableTableConfig } from '../../src/config/tableTypes.ts'

/** Replace `tblREPLACE_APP_USERS` with your base’s table id after setup. */
export const usersModuleTables = [
  {
    key: 'appUsers',
    label: 'App Users',
    tableId: 'tblxqLh6rNsqABbCR',
    tableName: 'App Users',
    primaryField: 'email',
    fields: {
      email: 'Email',
      displayName: 'Display name',
      username: 'Username',
      airtableUserId: 'Airtable user id',
      passwordHash: 'Password hash',
      role: 'Role',
      active: 'Active',
      notes: 'Notes',
    },
    columns: [
      { field: 'email', label: 'Email' },
      { field: 'displayName', label: 'Name' },
      { field: 'username', label: 'Username' },
      { field: 'active', label: 'Active' },
    ],
    list: {
      pageSize: 100,
      sort: [{ field: 'Email', direction: 'asc' }],
    },
    screens: ['usersList'],
    validation: {
      email: { required: false },
    },
  },
] as const satisfies readonly AirtableTableConfig[]
