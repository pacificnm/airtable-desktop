import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import { Action } from '../button/Action.tsx'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Link from '@mui/material/Link'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { useAirtable } from '../../hooks/useAirtable.ts'
import { useToast } from '../../hooks/useToast.ts'
import { OAuthSetupChecklist } from './OAuthSetupChecklist.tsx'

export interface AirtableConnectionDialogProps {
  open: boolean
  onClose: () => void
}

function ConnectionDialogBody({ onClose }: { onClose: () => void }) {
  const {
    baseId,
    authMode,
    isReady,
    hasPat,
    patSource,
    setPat,
    clearPat,
    setBaseId,
    startOAuthLogin,
    signOutOAuth,
    profiles,
    activeProfile,
    switchProfile,
    createProfile,
    renameProfile,
    deleteProfile,
  } = useAirtable()
  const toast = useToast()

  const [profileName, setProfileName] = useState(activeProfile.name)
  const [baseIdInput, setBaseIdInput] = useState(baseId ?? '')
  const [patInput, setPatInput] = useState('')
  const [oauthError, setOauthError] = useState<string | null>(null)

  const handleSave = () => {
    const nextBase = baseIdInput.trim()
    const nextPat = patInput.trim()
    if (profileName.trim() !== activeProfile.name) {
      renameProfile(activeProfile.id, profileName.trim())
    }
    if (nextBase) setBaseId(nextBase)
    if (nextPat) setPat(nextPat)
    if (!nextBase && !nextPat && profileName.trim() === activeProfile.name) {
      toast.info('No changes to save')
      onClose()
      return
    }
    toast.success('Connection profile saved')
    onClose()
  }

  const handleOAuth = async () => {
    setOauthError(null)
    try {
      await startOAuthLogin()
    } catch (err) {
      setOauthError(err instanceof Error ? err.message : 'OAuth failed to start')
    }
  }

  const handleAddProfile = () => {
    const n = profiles.length + 1
    createProfile(`Profile ${n}`)
    toast.info('New profile created — set base id and token, then save')
  }

  const handleDeleteProfile = () => {
    if (profiles.length <= 1) return
    deleteProfile(activeProfile.id)
    toast.info('Profile removed')
  }

  return (
    <>
      <DialogTitle>Airtable connection</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="connection-profile-label">Profile</InputLabel>
            <Select
              labelId="connection-profile-label"
              label="Profile"
              value={activeProfile.id}
              onChange={(e) => switchProfile(e.target.value)}
            >
              {profiles.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                  {p.baseId
                    ? p.baseId.length > 10
                      ? ` · ${p.baseId.slice(0, 10)}…`
                      : ` · ${p.baseId}`
                    : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <TextField
              label="Profile name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              size="small"
              fullWidth
            />
            <IconButton
              aria-label="Add profile"
              onClick={handleAddProfile}
              size="small"
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Delete profile"
              onClick={handleDeleteProfile}
              size="small"
              disabled={profiles.length <= 1}
            >
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography variant="body2" color="text.secondary">
              Status:
            </Typography>
            <Chip
              size="small"
              label={
                isReady
                  ? `Connected (${authMode === 'pat' ? 'PAT' : 'OAuth'})`
                  : authMode === 'oauth'
                    ? baseId
                      ? 'OAuth signed in'
                      : 'OAuth signed in — add Base ID'
                    : authMode === 'pat' && !baseId
                      ? 'PAT set — add Base ID'
                      : 'Not connected'
              }
              color={isReady ? 'success' : authMode !== 'none' ? 'warning' : 'default'}
            />
            {hasPat && patSource && (
              <Chip
                size="small"
                variant="outlined"
                label={
                  patSource === 'env'
                    ? 'PAT from environment'
                    : 'PAT saved in profile'
                }
              />
            )}
          </Stack>

          <TextField
            label="Base ID"
            value={baseIdInput}
            onChange={(e) => setBaseIdInput(e.target.value)}
            placeholder="appXXXXXXXXXXXXXX"
            fullWidth
            size="small"
            helperText="Stored in this profile only. From your base URL: airtable.com/app…/"
          />

          <TextField
            label="Personal access token"
            type="password"
            value={patInput}
            onChange={(e) => setPatInput(e.target.value)}
            placeholder={hasPat ? '••••••••  (enter new token to replace)' : 'pat…'}
            fullWidth
            size="small"
            autoComplete="off"
            helperText={
              <>
                Per profile. Create at{' '}
                <Link
                  href="https://airtable.com/create/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  airtable.com/create/tokens
                </Link>
                . Stored on this device only.
              </>
            }
          />

          <OAuthSetupChecklist />

          {oauthError ? <Alert severity="error">{oauthError}</Alert> : null}

          <Typography variant="caption" color="text.secondary">
            Each profile has its own base id and PAT. OAuth sign-in is saved on the
            active profile. Env <code style={{ fontSize: '0.75rem' }}>VITE_AIRTABLE_PAT</code>{' '}
            applies when the profile has no PAT.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1, px: 3, pb: 2 }}>
        {hasPat && patSource === 'stored' ? (
          <Button color="inherit" onClick={clearPat}>
            Remove profile PAT
          </Button>
        ) : null}
        {authMode === 'oauth' ? (
          <Button color="inherit" onClick={signOutOAuth}>
            Sign out OAuth
          </Button>
        ) : null}
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="outlined" onClick={() => void handleOAuth()}>
          Sign in with OAuth
        </Button>
        <Action
          onClick={handleSave}
          disabled={
            !baseIdInput.trim() &&
            !patInput.trim() &&
            profileName.trim() === activeProfile.name
          }
        >
          Save
        </Action>
      </DialogActions>
    </>
  )
}

function ConnectionDialogKeyedBody({ onClose }: { onClose: () => void }) {
  const { activeProfile, baseId } = useAirtable()
  return (
    <ConnectionDialogBody
      key={`${activeProfile.id}:${baseId ?? ''}`}
      onClose={onClose}
    />
  )
}

export function AirtableConnectionDialog({
  open,
  onClose,
}: AirtableConnectionDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {open ? <ConnectionDialogKeyedBody onClose={onClose} /> : null}
    </Dialog>
  )
}
