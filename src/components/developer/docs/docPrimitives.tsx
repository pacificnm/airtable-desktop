import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

/** Body copy with spacing below (replaces removed MUI `paragraph` prop). */
export function DocParagraph({ children }: { children: ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      {children}
    </Typography>
  )
}

export function Code({ children }: { children: string }) {
  return (
    <Box
      component="code"
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.8125rem',
        bgcolor: 'grey.100',
        px: 0.75,
        py: 0.25,
        borderRadius: 0.5,
      }}
    >
      {children}
    </Box>
  )
}

export function DocPre({ children }: { children: string }) {
  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        mb: 2,
        p: 1.5,
        fontSize: '0.75rem',
        bgcolor: 'grey.100',
        overflow: 'auto',
        borderRadius: 0.5,
      }}
    >
      {children}
    </Box>
  )
}

export function DocSection({
  title,
  children,
  hideTitle,
}: {
  title: string
  children: ReactNode
  /** When false, page chrome already shows the section title. */
  hideTitle?: boolean
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: 1,
        borderColor: 'divider',
      }}
    >
      {!hideTitle ? (
        <Typography
          variant="subtitle1"
          component="h2"
          sx={{ fontWeight: 600, color: 'primary.dark', mb: 1.5 }}
        >
          {title}
        </Typography>
      ) : null}
      {children}
    </Paper>
  )
}
