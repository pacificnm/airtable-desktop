/** Brand / semantic colors shared across built-in themes (from `tokens.css`). */
export const brandColors = {
  primaryMain: '#003F2D',
  primaryDark: '#012A2D',
  primaryLight: '#17E88F',
  primaryContrast: '#FFFFFF',
  secondaryMain: '#032842',
  secondaryLight: '#538184',
  secondaryContrast: '#FFFFFF',
  errorMain: '#E81717',
  errorLight: '#FFD4E0',
  errorDark: '#B10F41',
  warningMain: '#F1D230',
  warningDark: '#AF6002',
  successMain: '#048A0E',
  successDark: '#006400',
  successLight: '#E6FCE8',
} as const

export const appChromeCssVars = {
  '--app-chrome-bg': brandColors.primaryDark,
  '--app-chrome-fg': '#FFFFFF',
  '--app-chrome-fg-muted': '#CAD1D3',
  '--app-chrome-accent': brandColors.primaryLight,
  '--app-chrome-accent-contrast': brandColors.primaryDark,
  '--app-chrome-hover': 'rgba(255,255,255,0.06)',
  '--app-chrome-selected-bg': 'rgba(0,63,45,0.5)',
  '--app-chrome-border': 'rgba(255,255,255,0.1)',
} as const
