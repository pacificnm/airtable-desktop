import type { AppThemeDefinition } from '../types.ts'
import { appChromeCssVars, brandColors } from '../sharedPalette.ts'

export const darkTheme: AppThemeDefinition = {
  id: 'dark',
  label: 'Dark',
  description: 'Dark surfaces with the same brand chrome',
  mode: 'dark',
  cssVars: {
    ...appChromeCssVars,
    '--colors-semantic-text': '#D8E0E2',
    '--colors-semantic-surface': '#0F1617',
    '--app-surface-default': '#0F1617',
    '--app-surface-paper': '#1A2426',
    '--app-border-subtle': 'rgba(202,209,211,0.15)',
    '--app-status-connected-bg': 'rgba(23,232,143,0.12)',
  },
  palette: {
    primary: {
      main: brandColors.primaryLight,
      dark: brandColors.primaryMain,
      light: '#5CF2B0',
      contrastText: brandColors.primaryDark,
    },
    secondary: {
      main: '#5A8A9A',
      light: '#7AA3B0',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0F1617',
      paper: '#1A2426',
    },
    text: {
      primary: '#E6EAEA',
      secondary: '#9AA8AA',
      disabled: '#6B787A',
    },
    divider: 'rgba(202,209,211,0.15)',
    action: {
      hover: 'rgba(255,255,255,0.04)',
      selected: 'rgba(23,232,143,0.12)',
    },
  },
}
