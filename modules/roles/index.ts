import type { AppModuleDefinition } from '../../src/lib/modules/types.ts'
import { rolesTableBlueprints } from './blueprints.ts'
import { rolesModuleTables } from './tables.ts'

const rolesModule = {
  id: 'roles',
  name: 'Roles & Role Permissions',
  version: '0.1.0',
  dependsOn: ['config'] as const,
  description:
    'Roles and granular permissions linked to roles. Includes Airtable setup, tables, list screens, hooks, and validation.',
  readmePath: 'README.md',
  airtableSetupPath: 'airtable-setup.md',
  tables: rolesModuleTables,
  tableBlueprints: rolesTableBlueprints,
  screens: [
    {
      id: 'rolesList',
      title: 'Roles',
      importScreen: () => import('./screens/RolesListScreen.tsx'),
    },
    {
      id: 'rolePermissionsList',
      title: 'Role permissions',
      importScreen: () => import('./screens/RolePermissionsListScreen.tsx'),
    },
  ],
  menuSections: [
    {
      id: 'access',
      label: 'Access control',
      items: [
        {
          id: 'roles',
          label: 'Roles',
          icon: 'adminPanelSettings',
          viewId: 'rolesList',
        },
        {
          id: 'role-permissions',
          label: 'Role permissions',
          icon: 'security',
          viewId: 'rolePermissionsList',
        },
      ],
    },
  ],
} satisfies AppModuleDefinition

export default rolesModule
