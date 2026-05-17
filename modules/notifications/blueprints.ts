import type { ModuleTableBlueprint } from '../../src/lib/modules/tableBlueprints.ts'

export const notificationsTableBlueprints = [
  {
    tableKey: 'notifications',
    name: 'Notifications',
    fields: [
      { name: 'Title', type: 'singleLineText' },
      { name: 'Body', type: 'multilineText' },
      {
        name: 'Severity',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'info' },
            { name: 'success' },
            { name: 'warning' },
            { name: 'error' },
          ],
        },
      },
      { name: 'Source module', type: 'singleLineText' },
      { name: 'Event type', type: 'singleLineText' },
      {
        name: 'Read',
        type: 'checkbox',
        options: { color: 'blueBright', icon: 'check' },
      },
      { name: 'Metadata', type: 'multilineText' },
      { name: 'Link view', type: 'singleLineText' },
    ],
    seedRecords: [],
  },
] as const satisfies readonly ModuleTableBlueprint[]
