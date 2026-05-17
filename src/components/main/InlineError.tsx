import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import type { SxProps, Theme } from '@mui/material/styles'

export interface InlineErrorProps {
  message: string
  onRetry?: () => void
  retryLabel?: string
  sx?: SxProps<Theme>
}

/** Inline fetch / load failure with optional retry (list screens, sections). */
export function InlineError({
  message,
  onRetry,
  retryLabel = 'Retry',
  sx,
}: InlineErrorProps) {
  return (
    <Paper
      elevation={0}
      role="alert"
      sx={[
        {
          m: 2,
          p: 2,
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-start',
          border: 1,
          borderColor: 'error.light',
          bgcolor: 'error.light',
        },
        ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <ErrorOutlineOutlinedIcon color="error" sx={{ mt: 0.25, flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" color="error.dark" sx={{ fontWeight: 500 }}>
          {message}
        </Typography>
        {onRetry ? (
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={onRetry}
            sx={{ mt: 1.5 }}
          >
            {retryLabel}
          </Button>
        ) : null}
      </Box>
    </Paper>
  )
}
