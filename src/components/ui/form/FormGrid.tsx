import Grid from '@mui/material/Grid'
import type { ReactNode } from 'react'

/** Column span on a 12-column form grid (12 = full width). */
export type FormGridColumns = 1 | 2 | 3 | 4 | 6 | 8 | 10 | 12

export interface FormGridProps {
  children: ReactNode
  spacing?: number
  /** Render as a div when nested inside another form or FormSection. */
  nested?: boolean
}

/** Responsive 12-column grid for drawer and detail forms. */
export function FormGrid({ children, spacing = 2, nested = false }: FormGridProps) {
  return (
    <Grid
      container
      spacing={spacing}
      component={nested ? 'div' : 'form'}
      noValidate={!nested}
    >
      {children}
    </Grid>
  )
}

export interface FormGridItemProps {
  children: ReactNode
  /** Span out of 12 columns at all breakpoints (default 12). */
  columns?: FormGridColumns
}

export function FormGridItem({ children, columns = 12 }: FormGridItemProps) {
  return <Grid size={{ xs: columns }}>{children}</Grid>
}
