import type { AppModuleDefinition } from '../../src/lib/modules/types.ts'
import { usersTableBlueprints } from './blueprints.ts'
import { usersModuleTables } from './tables.ts'

const usersModule = {
  id: 'users',
  name: 'Users',
  version: '0.1.0',
  dependsOn: ['config', 'roles'] as const,
  description:
    'App user directory with Airtable OAuth identity or custom App Users table (PBKDF2 password hashes). Optional role links and OAuth profile extension.',
  readmePath: 'README.md',
  airtableSetupPath: 'airtable-setup.md',
  tables: usersModuleTables,
  tableBlueprints: usersTableBlueprints,
  screens: [
    {
      id: 'usersList',
      title: 'Users',
      importScreen: () => import('./screens/UsersListScreen.tsx'),
    },
  ],
  menuSections: [
    {
      id: 'directory',
      label: 'Directory',
      items: [
        {
          id: 'users',
          label: 'Users',
          icon: 'people',
          viewId: 'usersList',
        },
      ],
    },
  ],
} satisfies AppModuleDefinition

export default usersModule
