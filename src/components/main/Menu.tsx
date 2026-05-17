import { useState } from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import GridViewIcon from '@mui/icons-material/GridView'
import CloseIcon from '@mui/icons-material/Close'
import LinkIcon from '@mui/icons-material/Link'
import type { AppView } from './appView.ts'
import { menuIcons } from './menuIcons.tsx'
import { AirtableConnectionDialog } from '../airtable/ConnectionDialog.tsx'
import { useAirtable } from '../../hooks/useAirtable.ts'
import { getMainMenuSections } from '../../config/menu.ts'

const menuItemSx = {
  borderRadius: 0,
  py: 0.75,
  px: 1.5,
  color: 'var(--app-chrome-fg-muted)',
  '&:hover': {
    bgcolor: 'var(--app-chrome-hover)',
    color: 'var(--app-chrome-fg)',
  },
  '&.Mui-selected': {
    bgcolor: 'var(--app-chrome-selected-bg)',
    color: 'var(--app-chrome-accent)',
    '&:hover': { bgcolor: 'var(--app-chrome-selected-bg)' },
  },
}

const menuIconSx = { color: 'inherit', minWidth: 32 }

const menuPrimarySx = {
  '& .MuiListItemText-primary': { fontSize: '0.8125rem', fontWeight: 500 },
} as const

export interface MainMenuProps {
  open: boolean
  onClose: () => void
  view: AppView
  onViewChange: (view: AppView) => void
  title?: string
}

export function MainMenu({
  open,
  onClose,
  view,
  onViewChange,
  title = __APP_DISPLAY_NAME__,
}: MainMenuProps) {
  const { isReady } = useAirtable()
  const [connectionOpen, setConnectionOpen] = useState(false)

  const navigate = (next: AppView) => {
    onViewChange(next)
    onClose()
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 280,
            bgcolor: 'var(--app-chrome-bg)',
            color: 'var(--app-chrome-fg)',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GridViewIcon sx={{ fontSize: 16, color: 'white' }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Financier Display', Georgia, serif",
              fontSize: '1rem',
              fontWeight: 400,
            }}
          >
            {title}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: 'var(--app-chrome-fg-muted)' }}
          aria-label="Close menu"
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: 'var(--app-chrome-border)' }} />

      <Box
        component="nav"
        sx={{
          flex: 1,
          px: 1,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {getMainMenuSections().map((section) => (
          <Box key={section.id}>
            {section.label ? (
              <Typography
                variant="overline"
                sx={{
                  color: 'rgba(255,255,255,0.35)',
                  px: 1.5,
                  fontSize: '0.575rem',
                  letterSpacing: '0.1em',
                  mb: 0.5,
                  display: 'block',
                }}
              >
                {section.label}
              </Typography>
            ) : null}
            {section.items.map((item) => {
              const Icon = menuIcons[item.icon]
              return (
                <ListItemButton
                  key={item.id}
                  selected={item.isSelected(view)}
                  onClick={() => navigate(item.resolveNavigate(view))}
                  sx={menuItemSx}
                >
                  <ListItemIcon sx={menuIconSx}>
                    <Icon sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary={item.label} sx={menuPrimarySx} />
                </ListItemButton>
              )
            })}
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: 'var(--app-chrome-border)' }} />
      <Typography
        variant="caption"
        sx={{
          px: 2,
          py: 0.75,
          color: 'rgba(255,255,255,0.35)',
          display: 'block',
        }}
      >
        {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'} — go to screen
      </Typography>
      <Box sx={{ px: 1, py: 1 }}>
        <ListItemButton
          onClick={() => setConnectionOpen(true)}
          sx={menuItemSx}
        >
          <ListItemIcon sx={menuIconSx}>
            <LinkIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary="Airtable connection"
            secondary={isReady ? 'Connected' : 'Not connected'}
            sx={{
              ...menuPrimarySx,
              '& .MuiListItemText-secondary': {
                fontSize: '0.7rem',
                color: isReady ? 'var(--app-chrome-accent)' : 'rgba(255,255,255,0.35)',
              },
            }}
          />
        </ListItemButton>
      </Box>
      <AirtableConnectionDialog
        open={connectionOpen}
        onClose={() => setConnectionOpen(false)}
      />
    </Drawer>
  )
}
