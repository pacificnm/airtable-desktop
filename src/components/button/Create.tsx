import Button, { type ButtonProps } from '@mui/material/Button'
import { useTheme, type SxProps, type Theme } from '@mui/material/styles'
import AddIcon from '@mui/icons-material/Add'

export type CreateProps = Omit<ButtonProps, 'startIcon' | 'size'> & {
  /** Leading icon diameter (theme/font-relative px). */
  iconSize?: number
}

/**
 * Primary “create” action with a plus icon.
 *
 * - Default **`variant="text"`**: empty-state style (`mt`, primary text color).
 * - **`variant="contained"`**: toolbar / filled primary (Nike green), square corners.
 */
export function Create({
  children = 'Create service level',
  iconSize: iconSizeProp,
  variant = 'text',
  sx,
  ...props
}: CreateProps) {
  const theme = useTheme()
  const iconSize =
    iconSizeProp ?? (variant === 'contained' ? 16 : 14)

  const defaultSx: SxProps<Theme> =
    variant === 'contained'
      ? {
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': { bgcolor: theme.palette.primary.dark },
          borderRadius: 0,
        }
      : {
          mt: 2,
          color: theme.palette.primary.main,
          fontSize: '0.8125rem',
        }

  return (
    <Button
      variant={variant}
      size="small"
      startIcon={<AddIcon sx={{ fontSize: iconSize }} />}
      sx={[defaultSx, ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx])]}
      {...props}
    >
      {children}
    </Button>
  )
}
