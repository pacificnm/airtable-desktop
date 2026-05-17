import { LabelChip, StatusChip, type RecordCardLayout } from '../../../src/components/ui/index.ts'
import type { AppNotification } from './notificationFromRecords.ts'

export function notificationsCardLayout(): RecordCardLayout<AppNotification> {
  return {
    title: (n) => n.title,
    subtitle: (n) => n.body ?? n.sourceModule,
    footer: (n) => (
      <>
        <LabelChip label={n.severity} />
        <StatusChip active={n.read} activeLabel="Read" inactiveLabel="Unread" />
      </>
    ),
  }
}
