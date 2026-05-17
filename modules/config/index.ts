import type { AppModuleDefinition } from '../../src/lib/modules/types.ts'
import { configTableBlueprints } from './blueprints.ts'
import { configModuleTables } from './tables.ts'

const configModule = {
  id: 'config',
  name: 'App Config',
  version: '0.1.0',
  dependsOn: [] as const,
  description:
    'Key–value settings in Airtable for app options and per-module enable flags (module.*.enabled).',
  readmePath: 'README.md',
  airtableSetupPath: 'airtable-setup.md',
  tables: configModuleTables,
  tableBlueprints: configTableBlueprints,
  screens: [
    {
      id: 'configList',
      title: 'App config',
      importScreen: () => import('./screens/ConfigListScreen.tsx'),
    },
  ],
  menuSections: [
    {
      id: 'settings',
      label: 'Settings',
      items: [
        {
          id: 'app-config',
          label: 'App config',
          icon: 'settings',
          viewId: 'configList',
        },
      ],
    },
  ],
} satisfies AppModuleDefinition

export default configModule
