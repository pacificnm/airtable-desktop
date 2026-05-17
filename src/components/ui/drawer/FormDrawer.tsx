import type { ReactNode } from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CloseIcon from '@mui/icons-material/Close'
import { Action } from '../../button/Action.tsx'
import { TextButton } from '../button/TextButton.tsx'

export interface FormDrawerProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  onSave: () => void
  saveLabel?: string
  saving?: boolean
  saveDisabled?: boolean
  connectionWarning?: string | null
  validationError?: string | null
  mutationError?: string | null
  width?: number
}

/** Right-side create/edit drawer shell used by module CRUD screens. */
export function FormDrawer({
  open,
  title,
  onClose,
  children,
  onSave,
  saveLabel = 'Save',
  saving = false,
  saveDisabled = false,
  connectionWarning,
  validationError,
  mutationError,
  width = 420,
}: FormDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: '100vw', sm: width },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
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
          <Typography variant="h6" component="h2" sx={{ fontSize: '1rem', fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton aria-label="Close" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2 }}>
          {connectionWarning ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {connectionWarning}
            </Alert>
          ) : null}
          {validationError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationError}
            </Alert>
          ) : null}
          {mutationError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {mutationError}
            </Alert>
          ) : null}
          {children}
        </Box>
        <Divider />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            px: 2,
            py: 2,
          }}
        >
          <TextButton onClick={onClose} disabled={saving}>
            Cancel
          </TextButton>
          <Action
            onClick={onSave}
            loading={saving}
            disabled={saveDisabled}
          >
            {saveLabel}
          </Action>
        </Box>
      </Box>
    </Drawer>
  )
}
