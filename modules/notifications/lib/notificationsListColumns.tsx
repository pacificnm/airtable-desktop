import {
  DataTableText,
  LabelChip,
  StatusChip,
  type DataTableColumn,
} from '../../../src/components/ui/index.ts'
import type { AppNotification } from './notificationFromRecords.ts'

export function notificationsListColumns(): DataTableColumn<AppNotification>[] {
  return [
    {
      id: 'title',
      label: 'Title',
      primary: true,
      render: (n) => <DataTableText title={n.title}>{n.title}</DataTableText>,
    },
    {
      id: 'body',
      label: 'Body',
      maxWidth: 280,
      render: (n) => (
        <DataTableText secondary title={n.body}>
          {n.body ?? '—'}
        </DataTableText>
      ),
    },
    {
      id: 'severity',
      label: 'Severity',
      render: (n) => <LabelChip label={n.severity} />,
    },
    {
      id: 'sourceModule',
      label: 'Source',
      render: (n) => <DataTableText secondary>{n.sourceModule}</DataTableText>,
    },
    {
      id: 'read',
      label: 'Read',
      render: (n) => <StatusChip active={n.read} />,
    },
  ]
}
