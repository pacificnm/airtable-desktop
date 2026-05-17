import Alert from '@mui/material/Alert'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { TextButton } from '../../../src/components/ui/button/TextButton.tsx'
import {
  ConfirmDeleteDialog,
  RecordCollectionView,
  RecordListPage,
} from '../../../src/components/ui/index.ts'
import { useRecordViewMode } from '../../../src/hooks/useRecordViewMode.ts'
import { useToast } from '../../../src/hooks/useToast.ts'
import { publishNotification } from '../../../src/lib/notifications/index.ts'
import { useState } from 'react'
import { useNotifications } from '../hooks/useNotifications.ts'
import { useNotificationsCrud } from '../hooks/useNotificationsCrud.ts'
import type { AppNotification } from '../lib/notificationFromRecords.ts'
import { notificationsCardLayout } from '../lib/notificationsCardLayout.tsx'
import { notificationsListColumns } from '../lib/notificationsListColumns.tsx'

export default function NotificationsListScreen() {
  const toast = useToast()
  const { notifications, isLoading, isError, error, refetch } = useNotifications()
  const crud = useNotificationsCrud()
  const [viewMode, setViewMode] = useRecordViewMode('notificationsList')
  const [deleteTarget, setDeleteTarget] = useState<AppNotification | null>(null)

  const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)

  const handleMarkAllRead = async () => {
    if (unreadIds.length === 0) return
    try {
      await crud.markAllRead.mutateAsync(unreadIds)
      toast.success('All notifications marked read')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update notifications')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await crud.deleteNotification.mutateAsync(deleteTarget.id)
      toast.success('Notification deleted')
      setDeleteTarget(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  return (
    <>
      <RecordListPage
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        header={{
          title: 'Notifications',
          icon: <NotificationsIcon color="primary" />,
          count: notifications.length,
          action: (
            <TextButton onClick={() => void handleMarkAllRead()} disabled={unreadIds.length === 0}>
              Mark all read
            </TextButton>
          ),
        }}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={refetch}
        banner={
          <Alert severity="info" sx={{ mb: 2 }}>
            Other modules publish via{' '}
            <code>publishNotification()</code> from{' '}
            <code>src/lib/notifications</code>. Try:{' '}
            <TextButton
              size="small"
              onClick={() =>
                publishNotification({
                  title: 'Test notification',
                  body: 'Published from the notifications screen.',
                  sourceModule: 'notifications',
                  severity: 'info',
                })
              }
            >
              Send test
            </TextButton>
          </Alert>
        }
      >
        <RecordCollectionView<AppNotification>
          viewMode={viewMode}
          rows={notifications}
          getRowId={(n) => n.id}
          emptyTitle="No notifications yet"
          emptyDescription="Modules will publish notifications here when events occur."
          rowActions={{
            onEdit: (n) => {
              if (!n.read) void crud.markRead.mutateAsync(n.id)
            },
            onDelete: (n) => setDeleteTarget(n),
            editAriaLabel: (n) => (n.read ? 'Already read' : `Mark ${n.title} read`),
            deleteAriaLabel: (n) => `Delete ${n.title}`,
          }}
          table={{ columns: notificationsListColumns() }}
          card={notificationsCardLayout()}
        />
      </RecordListPage>

      <ConfirmDeleteDialog
        open={deleteTarget != null}
        title="Delete notification?"
        deleting={crud.deleteNotification.isPending}
        onCancel={() => !crud.deleteNotification.isPending && setDeleteTarget(null)}
        onConfirm={() => void handleDeleteConfirm()}
      >
        Remove <strong>{deleteTarget?.title}</strong>?
      </ConfirmDeleteDialog>
    </>
  )
}
