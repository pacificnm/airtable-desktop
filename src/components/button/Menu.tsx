import type { ReactNode } from 'react'
import IconButton, { type IconButtonProps } from '@mui/material/IconButton'
import type { SxProps, Theme } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'

const defaultSx: SxProps<Theme> = {
  color: '#CAD1D3',
  mr: -1.5,
  '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.08)' },
}

export type MenuButtonProps = Omit<IconButtonProps, 'children'> & {
  /** Shown inside the button. Defaults to a menu (hamburger) icon. */
  children?: ReactNode
  /** Pixel size for the default menu icon. Ignored if `children` is passed. */
  iconSize?: number
}

/**
 * App-shell control that opens the primary navigation drawer.
 * Styling matches the main header; pass `sx` to override or extend.
 */
export function MenuButton({
  'aria-label': ariaLabel = 'Open menu',
  children,
  iconSize = 22,
  sx,
  ...props
}: MenuButtonProps) {
  return (
    <IconButton
      aria-label={ariaLabel}
      sx={[defaultSx, ...(sx == null ? [] : Array.isArray(sx) ? sx : [sx])]}
      {...props}
    >
      {children ?? <MenuIcon sx={{ fontSize: iconSize }} />}
    </IconButton>
  )
}
