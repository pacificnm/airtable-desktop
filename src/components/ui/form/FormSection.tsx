import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { FormGrid } from './FormGrid.tsx'

export interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  /** Grid spacing inside the section (default 2). */
  spacing?: number
}

/** Titled block with a 12-column grid — use inside a parent form layout. */
export function FormSection({
  title,
  description,
  children,
  spacing = 2,
}: FormSectionProps) {
  return (
    <Box component="section">
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: description ? 0.5 : 1.5 }}>
        {title}
      </Typography>
      {description ? (
        <Typography
          variant="caption"
          color="text.secondary"
          component="p"
          sx={{ m: 0, mb: 1.5 }}
        >
          {description}
        </Typography>
      ) : null}
      <FormGrid nested spacing={spacing}>
        {children}
      </FormGrid>
    </Box>
  )
}
