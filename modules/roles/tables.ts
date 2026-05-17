import type { AirtableTableConfig } from '../../src/config/tableTypes.ts'

/** Replace `tblXXXXXXXX` with your base’s table IDs after setup. */
export const rolesModuleTables = [
  {
    key: 'roles',
    label: 'Roles',
    tableId: 'tblu9VeMW2oc4qBED',
    tableName: 'Roles',
    primaryField: 'name',
    fields: {
      name: 'Name',
      description: 'Description',
      active: 'Active',
    },
    columns: [
      { field: 'name', label: 'Name' },
      { field: 'description', label: 'Description' },
      { field: 'active', label: 'Active' },
    ],
    list: { pageSize: 50, sort: [{ field: 'Name', direction: 'asc' }] },
    screens: ['rolesList'],
    validation: {
      name: { required: true },
    },
  },
  {
    key: 'rolePermissions',
    label: 'Role Permissions',
    tableId: 'tblO1zlFZ72Js7cSc',
    tableName: 'Role Permissions',
    primaryField: 'label',
    fields: {
      label: 'Label',
      role: 'Role',
      resource: 'Resource',
      action: 'Action',
      allowed: 'Allowed',
    },
    columns: [
      { field: 'label', label: 'Label' },
      { field: 'role', label: 'Role' },
      { field: 'resource', label: 'Resource' },
      { field: 'action', label: 'Action' },
      { field: 'allowed', label: 'Allowed' },
    ],
    list: { pageSize: 100 },
    screens: ['rolePermissionsList'],
    validation: {
      label: { required: true },
      resource: { required: true },
      action: { required: true },
    },
  },
] as const satisfies readonly AirtableTableConfig[]
