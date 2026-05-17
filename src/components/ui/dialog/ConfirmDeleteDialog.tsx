import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import type { ReactNode } from 'react'
import { TextButton } from '../button/TextButton.tsx'
import { DangerButton } from '../button/DangerButton.tsx'

export interface ConfirmDeleteDialogProps {
  open: boolean
  title: string
  children: ReactNode
  onCancel: () => void
  onConfirm: () => void
  deleting?: boolean
  confirmLabel?: string
}

export function ConfirmDeleteDialog({
  open,
  title,
  children,
  onCancel,
  onConfirm,
  deleting = false,
  confirmLabel = 'Delete',
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={() => !deleting && onCancel()}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{children}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <TextButton onClick={onCancel} disabled={deleting}>
          Cancel
        </TextButton>
        <DangerButton loading={deleting} onClick={onConfirm}>
          {confirmLabel}
        </DangerButton>
      </DialogActions>
    </Dialog>
  )
}
