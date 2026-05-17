import type { AppModuleDefinition } from '../../src/lib/modules/types.ts'
import { notificationsTableBlueprints } from './blueprints.ts'
import { notificationsModuleTables } from './tables.ts'

const notificationsModule = {
  id: 'notifications',
  name: 'Notifications',
  version: '0.1.0',
  dependsOn: ['config'] as const,
  description:
    'Pub/sub notifications persisted in Airtable, header bell with unread badge, and list screen.',
  readmePath: 'README.md',
  airtableSetupPath: 'airtable-setup.md',
  tables: notificationsModuleTables,
  tableBlueprints: notificationsTableBlueprints,
  screens: [
    {
      id: 'notificationsList',
      title: 'Notifications',
      importScreen: () => import('./screens/NotificationsListScreen.tsx'),
    },
  ],
  menuSections: [
    {
      id: 'notifications',
      label: 'Notifications',
      items: [
        {
          id: 'notifications-list',
          label: 'All notifications',
          icon: 'notifications',
          viewId: 'notificationsList',
        },
      ],
    },
  ],
  headerSlots: [
    {
      id: 'bell',
      order: 10,
      importSlot: () => import('./components/NotificationHeaderSlot.tsx'),
    },
  ],
} satisfies AppModuleDefinition

export default notificationsModule
