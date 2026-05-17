import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'

export interface SettingsPanelProps {
  title: string
  children: ReactNode
  sx?: SxProps<Theme>
}

/** Outlined settings block (auth mode, module options). */
export function SettingsPanel({ title, children, sx }: SettingsPanelProps) {
  return (
    <Paper variant="outlined" sx={[{ p: 2, mb: 2 }, ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx])]}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  )
}
