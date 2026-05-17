import Box, { type BoxProps } from '@mui/material/Box'

export type FormStackProps = Omit<BoxProps, 'spacing'> & {
  spacing?: number
}

/** Standard vertical spacing for drawer forms. */
export function FormStack({ spacing = 2, sx, ...props }: FormStackProps) {
  return (
    <Box
      component="form"
      noValidate
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing,
        ...sx,
      }}
      {...props}
    />
  )
}
