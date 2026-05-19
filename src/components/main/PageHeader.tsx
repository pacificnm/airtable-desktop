import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { SxProps, Theme } from '@mui/material/styles'

const MONO =
  "'JetBrains Mono', ui-monospace, 'SF Mono', 'Space Mono', monospace"

const shellSx: SxProps<Theme> = {
  px: 3,
  py: 2,
  bgcolor: 'background.paper',
  borderBottom: 1,
  borderColor: 'divider',
}

export interface PageHeaderProps {
  title: string
  icon: ReactNode
  /** Toolbar control on the right (e.g. primary create button). */
  action?: ReactNode
  /** Optional count chip after the title. */
  count?: number
  /** Extra nodes after the title (e.g. supplemental chips). Shown before the numeric `count` chip. */
  titleAddon?: ReactNode
  /** Full-width row below the title row (e.g. breadcrumbs). */
  bottom?: ReactNode
  /** When set, renders a back arrow button before the icon. */
  onBack?: () => void
  /** Override the accessible label for the back button. */
  backLabel?: string
  sx?: SxProps<Theme>
}

/** Full-width strip under the app shell: icon, title, optional count, optional action. */
export function PageHeader({
  title,
  icon,
  action,
  count,
  titleAddon,
  bottom,
  onBack,
  backLabel = 'Back',
  sx,
}: PageHeaderProps) {
  return (
    <Box
      sx={[
        shellSx,
        ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onBack ? (
            <Tooltip title={backLabel}>
              <IconButton
                aria-label={backLabel}
                onClick={onBack}
                size="small"
                sx={{ mr: 0.5 }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {icon}
          <Typography
            sx={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>
          {titleAddon}
          {count !== undefined && (
            <Chip
              label={count}
              size="small"
              sx={{
                ml: 0.5,
                height: 20,
                fontSize: '0.6875rem',
                fontFamily: MONO,
                bgcolor: 'grey.100',
                color: 'text.secondary',
              }}
            />
          )}
        </Box>
        {action}
      </Box>
      {bottom != null ? <Box sx={{ mt: 1.5 }}>{bottom}</Box> : null}
    </Box>
  )
}
