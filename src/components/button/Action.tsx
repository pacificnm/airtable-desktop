import Button, { type ButtonProps } from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import type { SxProps, Theme } from '@mui/material/styles'

const actionSx: SxProps<Theme> = {
  flexShrink: 0,
  minHeight: 40,
  px: 2.5,
  fontWeight: 600,
  fontSize: '0.8125rem',
  letterSpacing: '0.02em',
  textTransform: 'none',
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  '&:hover': {
    bgcolor: 'primary.dark',
    boxShadow: 'none',
  },
  '&:active': {
    bgcolor: 'primary.dark',
  },
  '&.Mui-disabled': {
    bgcolor: 'action.disabledBackground',
    color: 'action.disabled',
  },
}

export type ActionProps = Omit<ButtonProps, 'variant' | 'color'> & {
  /** Shows a spinner and disables the control. */
  loading?: boolean
}

/**
 * Primary app action control (contained, brand green).
 * Use for main CTAs such as Save, Look up, Submit.
 */
export function Action({
  children,
  loading = false,
  disabled,
  startIcon,
  sx,
  ...props
}: ActionProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      disableElevation
      disabled={Boolean(disabled) || loading}
      startIcon={
        loading ? (
          <CircularProgress size={16} color="inherit" aria-hidden />
        ) : (
          startIcon
        )
      }
      sx={[actionSx, ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx])]}
      {...props}
    >
      {children}
    </Button>
  )
}
