import type { PaletteMode } from '@mui/material'

/** CSS custom properties applied on `document.documentElement` when a theme is active. */
export type ThemeCssVars = Record<`--${string}`, string>

export interface ThemePaletteDefinition {
  primary: {
    main: string
    dark: string
    light: string
    contrastText: string
  }
  secondary: {
    main: string
    light: string
    contrastText: string
  }
  background: {
    default: string
    paper: string
  }
  text: {
    primary: string
    secondary: string
    disabled: string
  }
  divider: string
  action: {
    hover: string
    selected: string
  }
}

/**
 * One app theme — add a file under `definitions/`, register in `definitions/index.ts`.
 * @see docs/themes.md
 */
export interface AppThemeDefinition {
  id: string
  label: string
  description?: string
  mode: PaletteMode
  cssVars: ThemeCssVars
  palette: ThemePaletteDefinition
}
