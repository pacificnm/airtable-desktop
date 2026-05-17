/** CSS custom properties from `src/tokens.css` (for previews and docs). */
export interface CssTokenDef {
  var: string
  label: string
}

export interface CssTokenGroup {
  id: string
  label: string
  tokens: readonly CssTokenDef[]
}

export const cssTokenGroups: readonly CssTokenGroup[] = [
  {
    id: 'core-palette',
    label: 'Core palette',
    tokens: [
      { var: '--colors-core_palette-primary-1', label: 'primary-1' },
      { var: '--colors-core_palette-primary-2', label: 'primary-2' },
      { var: '--colors-core_palette-primary-3', label: 'primary-3' },
      { var: '--colors-core_palette-primary-4', label: 'primary-4' },
      { var: '--colors-core_palette-primary-5', label: 'primary-5' },
      { var: '--colors-core_palette-primary-6', label: 'primary-6' },
    ],
  },
  {
    id: 'brand-secondary',
    label: 'Brand secondary',
    tokens: [
      { var: '--colors-brand-secondary-1', label: 'secondary-1' },
      { var: '--colors-brand-secondary-2', label: 'secondary-2' },
      { var: '--colors-brand-secondary-3', label: 'secondary-3' },
      { var: '--colors-brand-secondary-4', label: 'secondary-4' },
      { var: '--colors-brand-secondary-5', label: 'secondary-5' },
    ],
  },
  {
    id: 'brand-secondary-light',
    label: 'Brand secondary (light)',
    tokens: [
      { var: '--colors-brand-secondary-light-1', label: 'light-1' },
      { var: '--colors-brand-secondary-light-2', label: 'light-2' },
      { var: '--colors-brand-secondary-light-3', label: 'light-3' },
      { var: '--colors-brand-secondary-light-4', label: 'light-4' },
      { var: '--colors-brand-secondary-light-5', label: 'light-5' },
    ],
  },
  {
    id: 'semantic',
    label: 'Semantic',
    tokens: [
      { var: '--colors-semantic-text', label: 'text' },
      { var: '--colors-semantic-black', label: 'black' },
      { var: '--colors-semantic-white', label: 'white' },
      { var: '--colors-semantic-error', label: 'error' },
      { var: '--colors-semantic-warning', label: 'warning' },
      { var: '--colors-semantic-surface', label: 'surface' },
    ],
  },
  {
    id: 'system',
    label: 'System greys',
    tokens: [
      { var: '--colors-semantic-system-1', label: 'system-1' },
      { var: '--colors-semantic-system-2', label: 'system-2' },
      { var: '--colors-semantic-system-3', label: 'system-3' },
      { var: '--colors-semantic-system-4', label: 'system-4' },
      { var: '--colors-semantic-system-5', label: 'system-5' },
      { var: '--colors-semantic-system-6', label: 'system-6' },
      { var: '--colors-semantic-system-7', label: 'system-7' },
      { var: '--colors-semantic-system-8', label: 'system-8' },
      { var: '--colors-semantic-system-9', label: 'system-9' },
      { var: '--colors-semantic-system-10', label: 'system-10' },
      { var: '--colors-semantic-system-11', label: 'system-11' },
    ],
  },
  {
    id: 'font-family',
    label: 'Font families',
    tokens: [
      { var: '--typography-fontFamily-sans', label: 'sans' },
      { var: '--typography-fontFamily-serif', label: 'serif' },
      { var: '--typography-fontFamily-mono', label: 'mono' },
      { var: '--typography-fontFamily-noto-serif', label: 'noto-serif' },
      { var: '--typography-fontFamily-noto-sans', label: 'noto-sans' },
    ],
  },
  {
    id: 'font-size',
    label: 'Font sizes',
    tokens: [
      { var: '--typography-fontSize-10', label: '10' },
      { var: '--typography-fontSize-12', label: '12' },
      { var: '--typography-fontSize-14', label: '14' },
      { var: '--typography-fontSize-16', label: '16' },
      { var: '--typography-fontSize-18', label: '18' },
      { var: '--typography-fontSize-20', label: '20' },
      { var: '--typography-fontSize-22', label: '22' },
      { var: '--typography-fontSize-24', label: '24' },
      { var: '--typography-fontSize-32', label: '32' },
      { var: '--typography-fontSize-34', label: '34' },
      { var: '--typography-fontSize-36', label: '36' },
      { var: '--typography-fontSize-48', label: '48' },
      { var: '--typography-fontSize-60', label: '60' },
    ],
  },
  {
    id: 'font-weight',
    label: 'Font weights',
    tokens: [
      { var: '--typography-fontWeight-light', label: 'light' },
      { var: '--typography-fontWeight-normal', label: 'normal' },
      { var: '--typography-fontWeight-medium', label: 'medium' },
      { var: '--typography-fontWeight-heavy', label: 'heavy' },
      { var: '--typography-fontWeight-bold', label: 'bold' },
    ],
  },
  {
    id: 'line-height',
    label: 'Line heights',
    tokens: [
      { var: '--typography-lineHeight-tight', label: 'tight' },
      { var: '--typography-lineHeight-snug', label: 'snug' },
      { var: '--typography-lineHeight-normal', label: 'normal' },
      { var: '--typography-lineHeight-relaxed', label: 'relaxed' },
      { var: '--typography-lineHeight-loose', label: 'loose' },
    ],
  },
  {
    id: 'spacing',
    label: 'Spacing',
    tokens: [
      { var: '--spacing-1', label: '1' },
      { var: '--spacing-2', label: '2' },
      { var: '--spacing-3', label: '3' },
      { var: '--spacing-4', label: '4' },
      { var: '--spacing-5', label: '5' },
      { var: '--spacing-6', label: '6' },
      { var: '--spacing-7', label: '7' },
      { var: '--spacing-8', label: '8' },
      { var: '--spacing-9', label: '9' },
      { var: '--spacing-10', label: '10' },
    ],
  },
  {
    id: 'shape',
    label: 'Shape',
    tokens: [
      { var: '--shape-borderRadius-none', label: 'radius none' },
      { var: '--shape-borderRadius-sm', label: 'radius sm' },
      { var: '--shape-borderWidth-default', label: 'border width' },
      { var: '--shape-boxShadow-none', label: 'shadow none' },
    ],
  },
]

export function readCssToken(varName: string): string {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim()
}
