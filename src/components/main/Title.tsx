import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'

export interface TitleProps {
  /** Primary line (app / area name). Defaults to `package.json` → `appName`, then `name`. */
  title?: string
  /** Secondary line (e.g. ticket count). Omit to hide. */
  subtitle?: ReactNode
  /** Applied to the outer wrapper. */
  sx?: SxProps<Theme>
}

/**
 * App bar title block: display heading + optional muted subtitle.
 */
export function Title({ title = __APP_DISPLAY_NAME__, subtitle, sx }: TitleProps) {
  return (
    <Box sx={sx}>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'Financier Display', Georgia, serif",
            fontSize: '1.125rem',
            lineHeight: 1,
            fontWeight: 400,
          }}
        >
          {title}
        </Typography>
        {subtitle != null && subtitle !== '' && (
          <Typography
            variant="body2"
            sx={{ color: '#CAD1D3', mt: 0.25, fontSize: '0.75rem' }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
