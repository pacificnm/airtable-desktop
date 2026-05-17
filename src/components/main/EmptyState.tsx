import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'

export interface EmptyStateProps {
  title: string
  description?: ReactNode
  /** Small label above the title (e.g. screen name). */
  overline?: string
  icon?: ReactNode
  action?: ReactNode
  children?: ReactNode
  /** `centered` — full-page card; `compact` — inset block (e.g. table empty row). */
  variant?: 'centered' | 'compact'
  sx?: SxProps<Theme>
}

export function EmptyState({
  title,
  description,
  overline,
  icon,
  action,
  children,
  variant = 'centered',
  sx,
}: EmptyStateProps) {
  const compact = variant === 'compact'

  const body = (
    <Paper
      elevation={0}
      sx={{
        maxWidth: compact ? 'none' : 520,
        width: '100%',
        p: compact ? 2 : { xs: 3, sm: 4 },
        border: 1,
        borderColor: 'divider',
        bgcolor: compact ? 'transparent' : 'background.paper',
        textAlign: compact ? 'left' : 'center',
      }}
    >
      {icon ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: compact ? 'flex-start' : 'center',
            mb: 1.5,
            color: 'primary.main',
            '& .MuiSvgIcon-root': { fontSize: compact ? 32 : 40 },
          }}
        >
          {icon}
        </Box>
      ) : null}
      {overline ? (
        <Typography
          variant="overline"
          sx={{
            color: 'primary.main',
            fontWeight: 600,
            letterSpacing: '0.12em',
            display: 'block',
            mb: 1,
          }}
        >
          {overline}
        </Typography>
      ) : null}
      <Typography
        component="h2"
        sx={{
          fontFamily: compact ? 'inherit' : "'Financier Display', Georgia, serif",
          fontSize: compact ? '1rem' : { xs: '1.5rem', sm: '1.75rem' },
          fontWeight: compact ? 600 : 400,
          color: 'primary.dark',
          lineHeight: 1.25,
          mb: description || children || action ? 1.5 : 0,
        }}
      >
        {title}
      </Typography>
      {description ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: children || action ? 2 : 0 }}
        >
          {description}
        </Typography>
      ) : null}
      {children}
      {action ? (
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: compact ? 'flex-start' : 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {action}
        </Box>
      ) : null}
    </Paper>
  )

  if (compact) {
    return (
      <Box sx={sx}>
        {body}
      </Box>
    )
  }

  return (
    <Box
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'min(70vh, 560px)',
        },
        ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {body}
    </Box>
  )
}
