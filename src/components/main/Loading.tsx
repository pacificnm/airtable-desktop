import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import type { SxProps, Theme } from '@mui/material/styles'

export interface LoadingProps {
  /** Vertical padding on the flex container (theme spacing units). */
  py?: number
  /** Spinner diameter in px. */
  size?: number
  sx?: SxProps<Theme>
}

/** Centered primary-colored spinner in a flex row. */
export function Loading({ py = 8, size = 32, sx }: LoadingProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py,
        ...sx,
      }}
    >
      <CircularProgress size={size} sx={{ color: 'primary.main' }} />
    </Box>
  )
}
