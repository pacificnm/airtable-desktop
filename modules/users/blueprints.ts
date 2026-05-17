import type { ModuleTableBlueprint } from '../../src/lib/modules/tableBlueprints.ts'

export const usersTableBlueprints = [
  {
    tableKey: 'appUsers',
    name: 'App Users',
    fields: [
      { name: 'Email', type: 'singleLineText' },
      { name: 'Display name', type: 'singleLineText' },
      { name: 'Username', type: 'singleLineText' },
      { name: 'Airtable user id', type: 'singleLineText' },
      {
        name: 'Password hash',
        type: 'multilineText',
        description: 'PBKDF2 hash — set by the app only; never paste plain passwords',
      },
      {
        name: 'Role',
        type: 'multipleRecordLinks',
        linkToTableKey: 'roles',
      },
      {
        name: 'Active',
        type: 'checkbox',
        options: { color: 'greenBright', icon: 'check' },
      },
      { name: 'Notes', type: 'multilineText' },
    ],
  },
] as const satisfies readonly ModuleTableBlueprint[]
