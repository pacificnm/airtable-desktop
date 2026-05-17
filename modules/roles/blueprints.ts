import type { ModuleTableBlueprint } from '../../src/lib/modules/tableBlueprints.ts'

export const rolesTableBlueprints = [
  {
    tableKey: 'roles',
    name: 'Roles',
    fields: [
      { name: 'Name', type: 'singleLineText' },
      { name: 'Description', type: 'multilineText' },
      {
        name: 'Active',
        type: 'checkbox',
        options: { color: 'greenBright', icon: 'check' },
      },
    ],
  },
  {
    tableKey: 'rolePermissions',
    name: 'Role Permissions',
    fields: [
      { name: 'Label', type: 'singleLineText' },
      {
        name: 'Role',
        type: 'multipleRecordLinks',
        linkToTableKey: 'roles',
      },
      { name: 'Resource', type: 'singleLineText' },
      {
        name: 'Action',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'read' },
            { name: 'write' },
            { name: 'delete' },
            { name: 'admin' },
          ],
        },
      },
      {
        name: 'Allowed',
        type: 'checkbox',
        options: { color: 'greenBright', icon: 'check' },
      },
    ],
  },
] as const satisfies readonly ModuleTableBlueprint[]
