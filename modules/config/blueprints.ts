import type { ModuleTableBlueprint } from '../../src/lib/modules/tableBlueprints.ts'

export const configTableBlueprints = [
  {
    tableKey: 'appConfig',
    name: 'App Config',
    fields: [
      { name: 'Key', type: 'singleLineText' },
      { name: 'Value', type: 'multilineText' },
      {
        name: 'Value type',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'string' },
            { name: 'number' },
            { name: 'boolean' },
            { name: 'json' },
          ],
        },
      },
      { name: 'Label', type: 'singleLineText' },
      { name: 'Description', type: 'multilineText' },
      { name: 'Module', type: 'singleLineText' },
      {
        name: 'Active',
        type: 'checkbox',
        options: { color: 'greenBright', icon: 'check' },
      },
    ],
    seedRecords: [
      {
        fields: {
          Key: 'module.config.enabled',
          Value: 'true',
          'Value type': 'boolean',
          Module: 'config',
          Active: true,
        },
      },
      {
        fields: {
          Key: 'module.roles.enabled',
          Value: 'true',
          'Value type': 'boolean',
          Module: 'roles',
          Active: true,
        },
      },
      {
        fields: {
          Key: 'app.displayName',
          Value: 'My App',
          'Value type': 'string',
          Active: true,
        },
      },
      {
        fields: {
          Key: 'module.users.enabled',
          Value: 'true',
          'Value type': 'boolean',
          Module: 'users',
          Active: true,
        },
      },
      {
        fields: {
          Key: 'module.notifications.enabled',
          Value: 'true',
          'Value type': 'boolean',
          Module: 'notifications',
          Active: true,
        },
      },
      {
        fields: {
          Key: 'module.users.authProvider',
          Value: 'airtable_oauth',
          'Value type': 'string',
          Label: 'Users auth provider',
          Description:
            'airtable_oauth = Airtable OAuth whoami; custom_table = App Users table with hashed passwords',
          Module: 'users',
          Active: true,
        },
      },
      {
        fields: {
          Key: 'module.users.extendOAuthProfiles',
          Value: 'true',
          'Value type': 'boolean',
          Label: 'Extend OAuth profiles',
          Description:
            'When using airtable_oauth, store extra fields in App Users linked by Airtable user id',
          Module: 'users',
          Active: true,
        },
      },
    ],
  },
] as const satisfies readonly ModuleTableBlueprint[]
