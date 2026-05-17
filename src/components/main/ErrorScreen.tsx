import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from '../../theme.ts'
import { isDebugEnabled } from '../../lib/env/isDebugEnabled.ts'

export interface ErrorScreenProps {
  error: Error
  componentStack?: string | null
  onRetry?: () => void
  /** Full viewport vs inset in the main content column */
  variant?: 'full' | 'content'
}

export function ErrorScreen({
  error,
  componentStack,
  onRetry,
  variant = 'full',
}: ErrorScreenProps) {
  const showDetails = import.meta.env.DEV

  const body = (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: variant === 'full' ? '100dvh' : 'min(60vh, 480px)',
        p: 3,
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 520,
          width: '100%',
          p: { xs: 3, sm: 4 },
          border: 1,
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <ErrorOutlineOutlinedIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontFamily: "'Financier Display', Georgia, serif",
            fontWeight: 400,
            color: 'primary.dark',
            mb: 1,
          }}
        >
          Something went wrong
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The app hit an unexpected error. You can try again or reload the window.
          {isDebugEnabled()
            ? ' Open the debug panel from the app menu (View → Open Debug Panel) to inspect recent errors and network calls.'
            : null}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          {onRetry ? (
            <Button variant="contained" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
          <Button variant="outlined" onClick={() => window.location.reload()}>
            Reload app
          </Button>
        </Box>

        {showDetails ? (
          <Box
            sx={{
              mt: 3,
              textAlign: 'left',
              p: 1.5,
              bgcolor: 'grey.100',
              maxHeight: 200,
              overflow: 'auto',
            }}
          >
            <Typography
              variant="caption"
              component="pre"
              sx={{
                m: 0,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {error.message}
              {componentStack ? `\n\n${componentStack}` : ''}
              {error.stack ? `\n\n${error.stack}` : ''}
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            {error.message}
          </Typography>
        )}
      </Paper>
    </Box>
  )

  if (variant === 'content') {
    return body
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {body}
    </ThemeProvider>
  )
}
