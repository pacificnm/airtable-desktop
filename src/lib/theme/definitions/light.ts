import type { AppThemeDefinition } from '../types.ts'
import { appChromeCssVars, brandColors } from '../sharedPalette.ts'

export const lightTheme: AppThemeDefinition = {
  id: 'light',
  label: 'Light',
  description: 'Default Airtable-inspired shell',
  mode: 'light',
  cssVars: {
    ...appChromeCssVars,
    '--colors-semantic-text': '#435254',
    '--colors-semantic-surface': '#E6EAEA',
    '--app-surface-default': '#F5F7F7',
    '--app-surface-paper': '#FFFFFF',
    '--app-border-subtle': 'rgba(202,209,211,0.3)',
    '--app-status-connected-bg': '#E6F7F2',
  },
  palette: {
    primary: {
      main: brandColors.primaryMain,
      dark: brandColors.primaryDark,
      light: brandColors.primaryLight,
      contrastText: brandColors.primaryContrast,
    },
    secondary: {
      main: brandColors.secondaryMain,
      light: brandColors.secondaryLight,
      contrastText: brandColors.secondaryContrast,
    },
    background: {
      default: '#F5F7F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#435254',
      secondary: '#666666',
      disabled: '#999999',
    },
    divider: 'rgba(202,209,211,0.3)',
    action: {
      hover: '#F5F7F7',
      selected: 'rgba(0,63,45,0.08)',
    },
  },
}
