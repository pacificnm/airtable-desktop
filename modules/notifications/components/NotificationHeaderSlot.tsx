import { useState } from 'react'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import Typography from '@mui/material/Typography'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import type { AppView } from '../../../src/components/main/appView.ts'
import { useHeaderSlotContext } from '../../../src/components/main/headerSlotContext.ts'
import { useUnreadNotificationCount } from '../hooks/useUnreadNotificationCount.ts'
import { useNotifications } from '../hooks/useNotifications.ts'
import { useNotificationsCrud } from '../hooks/useNotificationsCrud.ts'

export default function NotificationHeaderSlot() {
  const slot = useHeaderSlotContext()
  const onNavigate = slot?.onNavigate
  const unread = useUnreadNotificationCount()
  const { notifications } = useNotifications()
  const crud = useNotificationsCrud()
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  const open = Boolean(anchor)

  const recent = notifications.slice(0, 8)

  const handleClose = () => setAnchor(null)

  const openNotification = (id: string, linkView?: string) => {
    handleClose()
    if (!crud.canMutate) return
    void crud.markRead.mutateAsync(id)
    if (linkView && onNavigate) {
      onNavigate(linkView as AppView)
    } else if (onNavigate) {
      onNavigate('notificationsList')
    }
  }

  return (
    <>
      <IconButton
        color="inherit"
        aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ color: 'var(--app-chrome-fg)' }}
      >
        <Badge badgeContent={unread > 0 ? unread : undefined} color="error" max={99}>
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxWidth: '95vw' } } }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        {recent.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
            No notifications yet.
          </Typography>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 320, overflow: 'auto' }}>
            {recent.map((n) => (
              <ListItemButton
                key={n.id}
                onClick={() => openNotification(n.id, n.linkView)}
                sx={{ opacity: n.read ? 0.7 : 1 }}
              >
                <ListItemText
                  primary={n.title}
                  secondary={n.body ?? n.sourceModule}
                  slotProps={{
                    primary: { noWrap: true },
                    secondary: { noWrap: true },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
        {onNavigate ? (
          <Box sx={{ borderTop: 1, borderColor: 'divider', p: 1 }}>
            <ListItemButton
              onClick={() => {
                handleClose()
                onNavigate('notificationsList')
              }}
            >
              <ListItemText primary="View all" />
            </ListItemButton>
          </Box>
        ) : null}
      </Menu>
    </>
  )
}
