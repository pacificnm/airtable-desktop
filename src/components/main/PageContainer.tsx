import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import type { SxProps, Theme } from '@mui/material/styles'

const shellSx = (minHeight: number | string): SxProps<Theme> => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight,
})

export interface PageContainerProps {
  children: ReactNode
  /** Minimum height of the page column (`360` by default, theme spacing units or px). */
  minHeight?: number | string
  sx?: SxProps<Theme>
}

/** Flex column filling `main`; hosts header strip + scrollable body pattern. */
export function PageContainer({
  children,
  minHeight = 360,
  sx,
}: PageContainerProps) {
  return (
    <Box
      sx={[
        shellSx(minHeight),
        ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  )
}
