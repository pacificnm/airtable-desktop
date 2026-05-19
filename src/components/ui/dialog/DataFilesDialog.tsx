import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useToast } from '@/hooks/useToast.ts'
import type { DataFileEntry } from '@/lib/files/electronFilesBridge.ts'
import { TextButton } from '../button/TextButton.tsx'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog.tsx'

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exp = Math.min(units.length - 1, Math.floor(Math.log10(bytes) / 3))
  const value = bytes / 1000 ** exp
  return `${value.toFixed(value >= 10 || exp === 0 ? 0 : 1)} ${units[exp]}`
}

function formatTimestamp(ms: number): string {
  try {
    return new Date(ms).toLocaleString()
  } catch {
    return ''
  }
}

export interface DataFilesDialogProps {
  open: boolean
  onClose: () => void
  /** Title shown in the dialog header. Defaults to "Data Files". */
  title?: string
  files: readonly DataFileEntry[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  bridgeMissing: boolean
  onRefresh: () => Promise<void> | void
  /** Removes the file. Resolved value indicates outcome; dialog handles toasts. */
  onDelete: (fileName: string) => Promise<{ ok: boolean; error?: string }>
}

/**
 * Lists working data files imported for a module and lets users remove
 * old ones. Uses a confirm dialog before delete to avoid accidents.
 */
export function DataFilesDialog({
  open,
  onClose,
  title = 'Data Files',
  files,
  isLoading,
  isRefreshing,
  error,
  bridgeMissing,
  onRefresh,
  onDelete,
}: DataFilesDialogProps) {
  const toast = useToast()
  const [confirmTarget, setConfirmTarget] = useState<DataFileEntry | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirmTarget) return
    setDeleting(true)
    const res = await onDelete(confirmTarget.name)
    setDeleting(false)
    if (res.ok) {
      toast.success(`Removed "${confirmTarget.name}"`)
      setConfirmTarget(null)
    } else {
      toast.error(res.error ?? 'Failed to delete file')
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => !deleting && onClose()}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span>{title}</span>
            <Tooltip title="Refresh">
              <span>
                <IconButton
                  size="small"
                  onClick={() => void onRefresh()}
                  disabled={isLoading || isRefreshing || bridgeMissing}
                  aria-label="Refresh data files"
                >
                  {isRefreshing ? (
                    <CircularProgress size={16} aria-hidden />
                  ) : (
                    <RefreshIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {bridgeMissing ? (
            <Alert severity="info">
              Data file management is only available in the desktop app.
            </Alert>
          ) : isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : files.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No data files uploaded yet.
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {files.map((file) => (
                <ListItem
                  key={file.path}
                  divider
                  secondaryAction={
                    <Tooltip title="Remove">
                      <span>
                        <IconButton
                          edge="end"
                          size="small"
                          aria-label={`Remove ${file.name}`}
                          onClick={() => setConfirmTarget(file)}
                          disabled={deleting}
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  }
                  sx={{ pl: 0, pr: 6 }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          wordBreak: 'break-all',
                        }}
                      >
                        {file.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatBytes(file.size)} · uploaded{' '}
                        {formatTimestamp(file.modifiedAt)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <TextButton onClick={onClose} disabled={deleting}>
            Close
          </TextButton>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={confirmTarget != null}
        title="Remove data file?"
        deleting={deleting}
        onCancel={() => !deleting && setConfirmTarget(null)}
        onConfirm={() => void handleDelete()}
      >
        Permanently remove <strong>{confirmTarget?.name}</strong> from the
        working directory? This cannot be undone.
      </ConfirmDeleteDialog>
    </>
  )
}
