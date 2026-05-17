import { createTheme, type Theme } from '@mui/material/styles'
import type { AppThemeDefinition } from './types.ts'
import { brandColors } from './sharedPalette.ts'

function buildComponentOverrides() {
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        sizeSmall: {
          fontSize: '0.75rem',
          padding: '4px 12px',
          minHeight: 32,
        },
        sizeMedium: {
          fontSize: '0.8125rem',
          padding: '6px 16px',
          minHeight: 36,
        },
      },
      defaultProps: { disableElevation: true },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 0 } },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 0, boxShadow: 'none' } },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          borderRadius: 0,
          boxShadow: 'none',
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 0, height: 'auto', fontWeight: 600 },
        sizeSmall: { fontSize: '0.625rem', height: 'auto', padding: '2px 0' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          borderColor: theme.palette.divider,
          padding: '10px 16px',
        }),
        head: ({ theme }: { theme: Theme }) => ({
          fontWeight: 600,
          fontSize: '0.6875rem',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
          color: theme.palette.text.secondary,
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          '&:hover': { backgroundColor: theme.palette.action.hover },
        }),
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          '&.Mui-active': { color: theme.palette.primary.main },
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          fontSize: '0.75rem',
          minHeight: 40,
          padding: '8px 16px',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: ({ theme }: { theme: Theme }) => ({
          backgroundColor: theme.palette.primary.light,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: { paper: { borderRadius: 0, boxShadow: 'none' } },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            fontSize: '0.875rem',
          },
        },
      },
      defaultProps: { size: 'small' as const },
    },
    MuiSelect: {
      styleOverrides: { root: { borderRadius: 0, fontSize: '0.875rem' } },
      defaultProps: { size: 'small' as const },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 0 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 0, boxShadow: 'none' } },
    },
    MuiToggleButtonGroup: {
      styleOverrides: { root: { borderRadius: 0 } },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'none' as const,
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '4px 12px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 0, height: 4 },
        bar: { borderRadius: 0 },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }: { theme: Theme }) => ({
          borderRadius: 0,
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiMenuItem: {
      styleOverrides: { root: { fontSize: '0.875rem' } },
    },
    MuiAppBar: {
      styleOverrides: { root: { boxShadow: 'none' } },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          color: theme.palette.grey[400],
          '&.Mui-checked': { color: theme.palette.primary.main },
        }),
      },
    },
  }
}

const typography = {
  fontFamily: "'Calibre', 'Inter', 'Arial', sans-serif",
  h1: { fontFamily: "'Financier Display', 'Georgia', serif", fontWeight: 400 },
  h2: { fontFamily: "'Financier Display', 'Georgia', serif", fontWeight: 400 },
  h3: { fontFamily: "'Financier Display', 'Georgia', serif", fontWeight: 400 },
  h4: { fontFamily: "'Financier Display', 'Georgia', serif", fontWeight: 400 },
  h5: { fontFamily: "'Financier Display', 'Georgia', serif", fontWeight: 400 },
  h6: { fontFamily: "'Financier Display', 'Georgia', serif", fontWeight: 400 },
  subtitle1: { fontWeight: 500 },
  subtitle2: {
    fontWeight: 600,
    fontSize: '0.6875rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  body1: { fontSize: '0.875rem' },
  body2: { fontSize: '0.75rem' },
  button: { fontWeight: 500, textTransform: 'none' as const },
  overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em' },
}

export function createMuiThemeFromDefinition(definition: AppThemeDefinition): Theme {
  const p = definition.palette
  return createTheme({
    palette: {
      mode: definition.mode,
      primary: p.primary,
      secondary: p.secondary,
      error: {
        main: brandColors.errorMain,
        light: brandColors.errorLight,
        dark: brandColors.errorDark,
      },
      warning: {
        main: brandColors.warningMain,
        dark: brandColors.warningDark,
      },
      success: {
        main: brandColors.successMain,
        dark: brandColors.successDark,
        light: brandColors.successLight,
      },
      background: p.background,
      text: p.text,
      divider: p.divider,
      action: {
        hover: p.action.hover,
        selected: p.action.selected,
      },
      grey: {
        50: '#F5F7F7',
        100: '#E6EAEA',
        200: '#DADFE0',
        300: '#CAD1D3',
        400: '#999999',
        500: '#808080',
        600: '#666666',
        700: '#4D4D4D',
        800: '#333333',
        900: '#1A1A1A',
      },
    },
    typography,
    shape: { borderRadius: 0 },
    components: buildComponentOverrides(),
  })
}
