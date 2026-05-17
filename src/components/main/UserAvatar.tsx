import { useState } from 'react'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import ListItemIcon from '@mui/material/ListItemIcon'
import CheckIcon from '@mui/icons-material/Check'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { useAppTheme } from '../../context/AppThemeProvider.tsx'
import { useAppUser } from '../../hooks/useAppUser.ts'
import { useAirtable } from '../../hooks/useAirtable.ts'
import { getInitials } from '../../utils/getInitials.ts'
import { AirtableConnectionDialog } from '../airtable/ConnectionDialog.tsx'

export function UserAvatar() {
  const { user, loading, refresh } = useAppUser()
  const { profiles, activeProfile, switchProfile } = useAirtable()
  const { themeId, themes, setThemeId } = useAppTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [connectionOpen, setConnectionOpen] = useState(false)
  const menuOpen = Boolean(anchorEl)

  const connected = user.authMode !== 'none'

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="Current user"
        aria-controls={menuOpen ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        sx={{
          p: 0.5,
          color: 'var(--app-chrome-fg)',
          '&:hover': { bgcolor: 'var(--app-chrome-hover)' },
        }}
      >
        {loading ? (
          <CircularProgress size={28} sx={{ color: 'var(--app-chrome-accent)' }} />
        ) : (
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: connected
                ? 'var(--app-chrome-accent)'
                : 'rgba(255,255,255,0.15)',
              color: connected
                ? 'var(--app-chrome-accent-contrast)'
                : 'var(--app-chrome-fg-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {getInitials(user.displayName)}
          </Avatar>
        )}
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 240,
              borderRadius: 0,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user.displayName}
          </Typography>
          {user.subtitle ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {user.subtitle}
            </Typography>
          ) : null}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Profile: {activeProfile.name}
          </Typography>
          {user.baseId ? (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 0.25,
                fontFamily: 'monospace',
                color: 'text.secondary',
              }}
            >
              Base {user.baseId}
            </Typography>
          ) : null}
        </Box>
        {profiles.length > 1 ? (
          <>
            <Typography
              variant="caption"
              sx={{ px: 2, py: 0.75, display: 'block', color: 'text.secondary' }}
            >
              Switch profile
            </Typography>
            {profiles.map((p) => (
              <MenuItem
                key={p.id}
                selected={p.id === activeProfile.id}
                onClick={() => {
                  switchProfile(p.id)
                  setAnchorEl(null)
                  refresh()
                }}
              >
                {p.id === activeProfile.id ? (
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                ) : (
                  <ListItemIcon sx={{ minWidth: 32 }} />
                )}
                {p.name}
              </MenuItem>
            ))}
            <Divider />
          </>
        ) : null}
        <Typography
          variant="caption"
          sx={{ px: 2, py: 0.75, display: 'block', color: 'text.secondary' }}
        >
          Appearance
        </Typography>
        {themes.map((t) => {
          const selected = t.id === themeId
          const ThemeIcon =
            t.mode === 'dark' ? DarkModeOutlinedIcon : LightModeOutlinedIcon
          return (
            <MenuItem
              key={t.id}
              selected={selected}
              onClick={() => {
                setThemeId(t.id)
                setAnchorEl(null)
              }}
            >
              {selected ? (
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon fontSize="small" />
                </ListItemIcon>
              ) : (
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <ThemeIcon fontSize="small" />
                </ListItemIcon>
              )}
              <Box>
                <Typography variant="body2">{t.label}</Typography>
                {t.description ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {t.description}
                  </Typography>
                ) : null}
              </Box>
            </MenuItem>
          )
        })}
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            setConnectionOpen(true)
          }}
        >
          Manage connection
        </MenuItem>
        {connected ? (
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              refresh()
            }}
          >
            Refresh profile
          </MenuItem>
        ) : null}
      </Menu>

      <AirtableConnectionDialog
        open={connectionOpen}
        onClose={() => {
          setConnectionOpen(false)
          refresh()
        }}
      />
    </>
  )
}
