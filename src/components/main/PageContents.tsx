import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import type { SxProps, Theme } from '@mui/material/styles'

const shellSx: SxProps<Theme> = {
  flex: 1,
  overflow: 'auto',
  bgcolor: 'background.default',
}

export interface PageContentsProps {
  children: ReactNode
  sx?: SxProps<Theme>
}

/** Scrollable body region below {@link PageHeader} inside {@link PageContainer}. */
export function PageContents({ children, sx }: PageContentsProps) {
  return (
    <Box
      sx={[shellSx, ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Box>
  )
}
