import Button, { type ButtonProps } from '@mui/material/Button'

export type DangerButtonProps = ButtonProps & {
  loading?: boolean
}

/** Destructive confirm action (delete dialogs). */
export function DangerButton({
  loading = false,
  disabled,
  children,
  ...props
}: DangerButtonProps) {
  return (
    <Button variant="contained" color="error" disabled={Boolean(disabled) || loading} {...props}>
      {loading ? 'Deleting…' : children}
    </Button>
  )
}
