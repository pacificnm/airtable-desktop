import type { AirtableTableConfig } from '../../src/config/tables.ts'

export const notificationsModuleTables = [
  {
    key: 'notifications',
    label: 'Notifications',
    tableId: 'tblwGv6T9dgcDDF9g',
    tableName: 'Notifications',
    primaryField: 'title',
    fields: {
      title: 'Title',
      body: 'Body',
      severity: 'Severity',
      sourceModule: 'Source module',
      eventType: 'Event type',
      read: 'Read',
      metadata: 'Metadata',
      linkView: 'Link view',
    },
    columns: [
      { field: 'title', label: 'Title' },
      { field: 'body', label: 'Body' },
      { field: 'severity', label: 'Severity' },
      { field: 'sourceModule', label: 'Source' },
      { field: 'read', label: 'Read' },
    ],
    list: {
      pageSize: 100,
    },
    screens: ['notificationsList'],
    validation: {
      title: { required: true },
      sourceModule: { required: true },
    },
  },
] as const satisfies readonly AirtableTableConfig[]
